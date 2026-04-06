import { NextResponse } from "next/server";

import { landingContent } from "@/lib/content";
import {
  deriveKitchenProfile,
  formatLeadSummary,
  isValidContact,
  normalizeAnswersForContactMode,
  normalizePhone,
  normalizePhoneIntent,
  normalizeTelegramContact,
  QUIZ_SOURCE,
  QUIZ_VERSION,
  type ContactMode,
  type KitchenAnswers,
  type KitchenLeadPayload,
  type PhoneIntent,
} from "@/lib/kitchen-quiz";

type LeadBody = Partial<KitchenLeadPayload>;
type RateLimitBucket = number[];

const MAX_PAYLOAD_BYTES = 8 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const rateLimitBuckets = new Map<string, RateLimitBucket>();

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimitStatus = registerAttempt(ip);

  if (!rateLimitStatus.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.split(";")[0].trim() !== "application/json") {
    return NextResponse.json({ ok: false, error: "UNSUPPORTED_MEDIA_TYPE" }, { status: 415 });
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : NaN;

  if (Number.isFinite(contentLength) && contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  const origin = request.headers.get("origin");

  if (origin) {
    const allowedOrigin = new URL(request.url).origin;

    if (origin !== allowedOrigin) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN_ORIGIN" }, { status: 403 });
    }
  }

  const rawBody = await request.text();

  if (getByteLength(rawBody) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  const body = (() => {
    try {
      return JSON.parse(rawBody) as LeadBody | null;
    } catch {
      return null;
    }
  })();

  if (!body) {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return new NextResponse(null, { status: 204 });
  }

  const answers = body.answers;

  if (!hasRequiredAnswers(answers)) {
    return NextResponse.json({ ok: false, error: "INCOMPLETE_ANSWERS" }, { status: 400 });
  }

  const normalizedAnswers = normalizeAnswersForContactMode(answers);
  const normalizedContact = normalizeContactValue(answers.contactMode, answers.contactValue);

  if (!isValidContact(answers.contactMode, answers.contactValue) || !normalizedContact) {
    return NextResponse.json({ ok: false, error: "INVALID_CONTACT" }, { status: 400 });
  }

  if (answers.contactMode === "phone" && !normalizePhoneIntent(answers.phoneIntent)) {
    return NextResponse.json({ ok: false, error: "INVALID_PHONE_INTENT" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_NOT_CONFIGURED" }, { status: 500 });
  }

  const profile = deriveKitchenProfile(normalizedAnswers);
  const message = buildLeadMessage({
    answers: {
      ...normalizedAnswers,
      contactValue: normalizedContact,
    },
    sessionId: body.sessionId?.trim() || "unknown",
    device: body.device === "mobile" ? "mobile" : "desktop",
    timestamp: body.timestamp?.trim() || "",
    utm: body.utm ?? {},
    quizVersion: QUIZ_VERSION,
    source: QUIZ_SOURCE,
  }, profile);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;

  if (!response.ok || !result?.ok) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_SEND_FAILED" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .find(Boolean);

    if (firstIp) {
      return firstIp;
    }
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function registerAttempt(ip: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const currentBucket = rateLimitBuckets.get(ip) ?? [];
  const activeBucket = currentBucket.filter((timestamp) => timestamp > windowStart);
  const nextBucket = [...activeBucket, now];

  rateLimitBuckets.set(ip, nextBucket);
  pruneRateLimitBuckets(windowStart);

  return {
    ok: nextBucket.length <= RATE_LIMIT_MAX_ATTEMPTS,
  };
}

function pruneRateLimitBuckets(windowStart: number) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    const activeBucket = bucket.filter((timestamp) => timestamp > windowStart);

    if (activeBucket.length) {
      rateLimitBuckets.set(key, activeBucket);
    } else {
      rateLimitBuckets.delete(key);
    }
  }
}

function getByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function hasRequiredAnswers(answers: KitchenAnswers | undefined): answers is Required<
  Pick<KitchenAnswers, "kitchenType" | "kitchenSize" | "budget" | "timeline" | "contactMode" | "contactValue">
> &
  KitchenAnswers {
  return Boolean(
    answers?.kitchenType &&
      answers.kitchenSize &&
      answers.budget &&
      answers.timeline &&
      answers.contactMode &&
      answers.contactValue?.trim(),
  );
}

function normalizeContactValue(mode: ContactMode, value: string) {
  return mode === "phone" ? normalizePhone(value) : normalizeTelegramContact(value);
}

function buildLeadMessage(payload: KitchenLeadPayload, profile = deriveKitchenProfile(payload.answers)) {
  const timelineLabel = profile.timelineLabel ?? "Не указан";
  const phoneIntentLabel = getPhoneIntentLabel(payload.answers.phoneIntent);
  const lines = [
    "Новая заявка с квиза",
    "",
    `Источник: ${payload.source}`,
    `Версия квиза: ${payload.quizVersion}`,
    `Время: ${payload.timestamp || "не указано"}`,
    `Session ID: ${payload.sessionId}`,
    `Device: ${payload.device}`,
    "",
    `Город: ${landingContent.siteConfig.city}`,
    `Профиль: ${formatLeadSummary(profile)}`,
    `Планировка: ${profile.recommendedLayout}`,
    `Пространство: ${profile.spaceLabel}`,
    `Бюджет: ${profile.budgetLabel}`,
    `Срок: ${timelineLabel}`,
    `Канал контакта: ${payload.answers.contactMode === "phone" ? "Телефон" : "Telegram"}`,
    ...(phoneIntentLabel ? [`Предпочтительный контакт: ${phoneIntentLabel}`] : []),
    `Контакт: ${payload.answers.contactValue ?? ""}`,
  ];

  const utmLines = [
    payload.utm.source ? `UTM Source: ${payload.utm.source}` : null,
    payload.utm.medium ? `UTM Medium: ${payload.utm.medium}` : null,
    payload.utm.campaign ? `UTM Campaign: ${payload.utm.campaign}` : null,
    payload.utm.content ? `UTM Content: ${payload.utm.content}` : null,
    payload.utm.term ? `UTM Term: ${payload.utm.term}` : null,
  ].filter((line): line is string => Boolean(line));

  if (utmLines.length) {
    lines.push("", ...utmLines);
  }

  return lines.join("\n");
}

function getPhoneIntentLabel(phoneIntent: PhoneIntent | undefined) {
  if (phoneIntent === "call") {
    return "Перезвоните мне";
  }

  if (phoneIntent === "message") {
    return "Напишите мне";
  }

  return "";
}

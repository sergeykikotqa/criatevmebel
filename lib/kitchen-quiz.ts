export const QUIZ_DRAFT_KEY = "kitchen-quiz-v3";
export const QUIZ_SOURCE = "kitchen-landing-v1";
export const QUIZ_VERSION = "v3";

export type ContactMode = "phone" | "telegram";
export type PhoneIntent = "call" | "message";
export type DeviceKind = "mobile" | "desktop";

export type QuizScreen =
  | "intro"
  | "step-1"
  | "step-2"
  | "step-3"
  | "budget-loader"
  | "profile-preview"
  | "step-4"
  | "step-5"
  | "submit-pending"
  | "submit-result"
  | "success"
  | "error-fallback";

export type KitchenTypeValue = "straight" | "corner" | "u-shaped" | "unknown";
export type KitchenSizeValue = "lt2" | "2to3" | "3to5" | "gt5";
export type BudgetValue = "lt100" | "100to200" | "200to400" | "gt400";
export type TimelineValue = "urgent" | "month" | "research";

export type KitchenAnswers = {
  kitchenType?: KitchenTypeValue;
  kitchenSize?: KitchenSizeValue;
  budget?: BudgetValue;
  timeline?: TimelineValue;
  contactMode?: ContactMode;
  phoneIntent?: PhoneIntent;
  contactValue?: string;
};

export type UTMParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type DerivedKitchenProfile = {
  recommendedLayout: string;
  spaceLabel: string;
  budgetLabel: string;
  timelineLabel?: string;
  summaryLine: string;
  recommendationHint: string;
};

export type KitchenQuizDraft = {
  currentScreen: QuizScreen;
  answers: KitchenAnswers;
  sessionId: string;
  utm: UTMParams;
  startedAt: string;
  hasSeenPreview: boolean;
};

export type KitchenLeadPayload = {
  answers: KitchenAnswers;
  sessionId: string;
  device: DeviceKind;
  timestamp: string;
  utm: UTMParams;
  quizVersion: typeof QUIZ_VERSION;
  source: typeof QUIZ_SOURCE;
  website?: string;
};

export const STEP_SCREENS = ["step-1", "step-2", "step-3", "step-4", "step-5"] as const;

type StepScreen = (typeof STEP_SCREENS)[number];

const SCREEN_STEP_MAP: Record<StepScreen, keyof KitchenAnswers | "contact"> = {
  "step-1": "kitchenType",
  "step-2": "kitchenSize",
  "step-3": "budget",
  "step-4": "timeline",
  "step-5": "contact",
};

const LAYOUT_LABELS: Record<KitchenTypeValue, string> = {
  straight: "Прямая кухня",
  corner: "Угловая кухня",
  "u-shaped": "П-образная кухня",
  unknown: "Формат уточним",
};

const SPACE_LABELS: Record<KitchenSizeValue, string> = {
  lt2: "До 2 м",
  "2to3": "2–3 м",
  "3to5": "3–5 м",
  gt5: "Более 5 м",
};

const BUDGET_LABELS: Record<BudgetValue, string> = {
  lt100: "До 100 000 ₽",
  "100to200": "100–200 тыс.",
  "200to400": "200–400 тыс.",
  gt400: "400+ тыс.",
};

const TIMELINE_LABELS: Record<TimelineValue, string> = {
  urgent: "Срочно",
  month: "В течение месяца",
  research: "Пока рассматриваю",
};

export function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

export function createQuizDraft(search = ""): KitchenQuizDraft {
  return {
    currentScreen: "intro",
    answers: {},
    sessionId: createSessionId(),
    utm: getUtmParams(search),
    startedAt: new Date().toISOString(),
    hasSeenPreview: false,
  };
}

export function formatTimestamp(date = new Date()) {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ];
  const time = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ];

  return `${parts.join("-")} ${time.join(":")}`;
}

export function getDeviceKind() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop" as const;
  }

  return window.matchMedia("(min-width: 70rem)").matches ? "desktop" : "mobile";
}

export function getUtmParams(search: string) {
  const params = new URLSearchParams(search);

  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    term: params.get("utm_term") ?? undefined,
  } satisfies UTMParams;
}

export function hasStoredAnswers(draft: KitchenQuizDraft) {
  const answers = normalizeAnswersForContactMode(draft.answers);

  return Boolean(
    answers.kitchenType ||
      answers.kitchenSize ||
      answers.budget ||
      answers.timeline ||
      answers.contactValue?.trim() ||
      normalizePhoneIntent(answers.phoneIntent),
  );
}

export function isStepScreen(screen: QuizScreen): screen is StepScreen {
  return STEP_SCREENS.includes(screen as StepScreen);
}

export function getStepNumber(screen: QuizScreen) {
  if (isStepScreen(screen)) {
    return Number(screen.replace("step-", ""));
  }

  if (screen === "budget-loader" || screen === "profile-preview") {
    return 3;
  }

  if (screen === "submit-pending" || screen === "submit-result" || screen === "success" || screen === "error-fallback") {
    return 5;
  }

  return 0;
}

export function getStepAnswerKey(screen: StepScreen) {
  return SCREEN_STEP_MAP[screen];
}

export function restoreStableScreen(screen: QuizScreen) {
  if (screen === "budget-loader") {
    return "profile-preview" as const;
  }

  if (screen === "submit-pending" || screen === "submit-result" || screen === "error-fallback") {
    return "step-5" as const;
  }

  return screen;
}

export function normalizeStoredDraft(storedDraft: KitchenQuizDraft, fallbackDraft: KitchenQuizDraft): KitchenQuizDraft {
  const nextDraft: KitchenQuizDraft = {
    currentScreen: restoreStableScreen(storedDraft.currentScreen),
    answers: normalizeAnswersForContactMode({
      ...fallbackDraft.answers,
      ...storedDraft.answers,
    }),
    sessionId: storedDraft.sessionId || fallbackDraft.sessionId,
    utm: { ...fallbackDraft.utm, ...storedDraft.utm },
    startedAt: storedDraft.startedAt || fallbackDraft.startedAt,
    hasSeenPreview: Boolean(storedDraft.hasSeenPreview),
  };

  const hasRestoreableProgress = Boolean(
    nextDraft.answers.kitchenType ||
      nextDraft.answers.kitchenSize ||
      nextDraft.answers.budget ||
      nextDraft.answers.timeline ||
      nextDraft.answers.contactValue?.trim(),
  );

  if (!hasRestoreableProgress || !hasStoredAnswers(nextDraft)) {
    return fallbackDraft;
  }

  return nextDraft;
}

export function deriveKitchenProfile(answers: KitchenAnswers): DerivedKitchenProfile {
  const recommendedLayout = answers.kitchenType ? LAYOUT_LABELS[answers.kitchenType] : "Формат подберем";
  const spaceLabel = answers.kitchenSize ? SPACE_LABELS[answers.kitchenSize] : "Размер уточним";
  const budgetLabel = answers.budget ? BUDGET_LABELS[answers.budget] : "Бюджет уточним";
  const timelineLabel = answers.timeline ? TIMELINE_LABELS[answers.timeline] : undefined;

  const summaryParts = [
    answers.kitchenType ? LAYOUT_LABELS[answers.kitchenType] : null,
    answers.kitchenSize ? SPACE_LABELS[answers.kitchenSize] : null,
    answers.budget ? BUDGET_LABELS[answers.budget] : null,
  ].filter((value): value is string => Boolean(value));

  return {
    recommendedLayout,
    spaceLabel,
    budgetLabel,
    timelineLabel,
    summaryLine: summaryParts.join(" / "),
    recommendationHint: getRecommendationHint(answers.kitchenSize, answers.budget),
  };
}

export function formatLeadSummary(profile: DerivedKitchenProfile) {
  return [profile.recommendedLayout, profile.spaceLabel, profile.budgetLabel].join(" / ");
}

export function normalizePhoneIntent(value: unknown) {
  if (value === "call" || value === "message") {
    return value;
  }

  return null;
}

export function normalizeAnswersForContactMode(answers: KitchenAnswers): KitchenAnswers {
  if (answers.contactMode !== "phone") {
    return {
      ...answers,
      phoneIntent: undefined,
    };
  }

  return {
    ...answers,
    phoneIntent: normalizePhoneIntent(answers.phoneIntent) ?? undefined,
  };
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 10) {
    return null;
  }

  if (digits.length === 10) {
    return formatRuPhone(`7${digits}`);
  }

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return formatRuPhone(`7${digits.slice(1)}`);
  }

  return `+${digits}`;
}

export function normalizeTelegramContact(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withoutUrl = trimmed.replace(/^https?:\/\/t\.me\//i, "").trim();
  const compact = withoutUrl.replace(/\s+/g, "");

  if (/^@?[a-zA-Z0-9_]{3,}$/.test(compact)) {
    return compact.startsWith("@") ? compact : `@${compact}`;
  }

  if (/^\+?\d{6,}$/.test(compact)) {
    return compact;
  }

  return trimmed.length >= 3 ? trimmed : null;
}

export function isValidContact(mode: ContactMode | undefined, value: string | undefined) {
  if (!mode || !value) {
    return false;
  }

  return Boolean(mode === "phone" ? normalizePhone(value) : normalizeTelegramContact(value));
}

function formatRuPhone(digits: string) {
  if (digits.length !== 11 || !digits.startsWith("7")) {
    return `+${digits}`;
  }

  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function getRecommendationHint(size?: KitchenSizeValue, budget?: BudgetValue) {
  if (!size || !budget) {
    return "";
  }

  if ((size === "lt2" || size === "2to3") && (budget === "lt100" || budget === "100to200")) {
    return "Подойдет компактная и практичная конфигурация без лишних перегрузок.";
  }

  if ((size === "2to3" || size === "3to5") && (budget === "100to200" || budget === "200to400")) {
    return "Можно подобрать сбалансированное решение по стилю, хранению и рабочей поверхности.";
  }

  if ((size === "3to5" || size === "gt5") && (budget === "200to400" || budget === "gt400")) {
    return "Есть пространство для более выразительного и функционального решения с хорошей вместимостью.";
  }

  if (size === "gt5") {
    return "Есть смысл смотреть более вместительные и выразительные конфигурации под вашу планировку.";
  }

  return "Можно собрать аккуратное решение под ваши параметры без лишней сложности.";
}

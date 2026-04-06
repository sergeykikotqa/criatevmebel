"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { QuizContent } from "@/lib/content";
import {
  createQuizDraft,
  deriveKitchenProfile,
  formatTimestamp,
  getDeviceKind,
  getStepAnswerKey,
  getStepNumber,
  hasStoredAnswers,
  isStepScreen,
  isValidContact,
  normalizeAnswersForContactMode,
  normalizePhone,
  normalizeTelegramContact,
  normalizeStoredDraft,
  QUIZ_DRAFT_KEY,
  QUIZ_SOURCE,
  QUIZ_VERSION,
  type ContactMode,
  type KitchenAnswers,
  type KitchenLeadPayload,
  type KitchenQuizDraft,
  type PhoneIntent,
  type QuizScreen,
} from "@/lib/kitchen-quiz";

type KitchenQuizProps = {
  city: string;
  telegramUrl: string;
  content: QuizContent;
};

type ChoiceStepScreen = "step-1" | "step-2" | "step-3" | "step-4";

export function KitchenQuiz(props: KitchenQuizProps) {
  const { telegramUrl, content } = props;

  const [answers, setAnswers] = useState<KitchenAnswers>({});
  const [screen, setScreen] = useState<QuizScreen>("intro");
  const [hasSeenPreview, setHasSeenPreview] = useState(false);
  const [sessionId, setSessionId] = useState(() => createQuizDraft().sessionId);
  const [utm, setUtm] = useState<KitchenQuizDraft["utm"]>({});
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [isHydrated, setIsHydrated] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const hydrateTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const flowTimerRef = useRef<number | null>(null);
  const submitRunRef = useRef(0);
  const isMountedRef = useRef(false);
  const hasSeenPreviewRef = useRef(false);

  const profile = deriveKitchenProfile(answers);
  const stepNumber = getStepNumber(screen);
  const progressValue = `${(stepNumber / 5) * 100}%`;
  const showProgressLabel = isStepScreen(screen);
  const showSocialProof = screen === "step-2" || screen === "step-3";

  function hydrateWithDraft(draft: KitchenQuizDraft, shouldPromptResume: boolean) {
    setAnswers(draft.answers);
    setScreen(draft.currentScreen);
    setSessionId(draft.sessionId);
    setUtm(draft.utm);
    setStartedAt(draft.startedAt);
    setHasSeenPreview(draft.hasSeenPreview);
    setShowResumePrompt(shouldPromptResume);
    setContactError(null);
    setIsHydrated(true);
  }

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      submitRunRef.current += 1;
      clearHydrateTimer(hydrateTimerRef);
      clearAutoAdvanceTimer(autoAdvanceTimerRef);
      clearFlowTimer(flowTimerRef);
    };
  }, []);

  useEffect(() => {
    hasSeenPreviewRef.current = hasSeenPreview;
  }, [hasSeenPreview]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    hydrateTimerRef.current = window.setTimeout(() => {
      const fallbackDraft = createQuizDraft(window.location.search);
      const storedDraft = readStoredDraft();

      if (!storedDraft || storedDraft.currentScreen === "success") {
        if (storedDraft?.currentScreen === "success") {
          window.localStorage.removeItem(QUIZ_DRAFT_KEY);
        }

        hydrateWithDraft(fallbackDraft, false);
        return;
      }

      const restoredDraft = normalizeStoredDraft(storedDraft, fallbackDraft);
      hydrateWithDraft(restoredDraft, hasStoredAnswers(restoredDraft));
    }, 0);

    return () => {
      clearHydrateTimer(hydrateTimerRef);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    if (screen === "success") {
      clearDraftStorage();
      return;
    }

    const draft: KitchenQuizDraft = {
      currentScreen: screen,
      answers,
      sessionId,
      utm,
      startedAt,
      hasSeenPreview,
    };

    if (hasStoredAnswers(draft)) {
      window.localStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(draft));
    } else {
      clearDraftStorage();
    }
  }, [answers, hasSeenPreview, isHydrated, screen, sessionId, startedAt, utm]);

  function transitionTo(nextScreen: QuizScreen) {
    clearAutoAdvanceTimer(autoAdvanceTimerRef);
    clearFlowTimer(flowTimerRef);
    setScreen(nextScreen);
  }

  function scheduleAutoAdvance(callback: () => void) {
    clearAutoAdvanceTimer(autoAdvanceTimerRef);
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      callback();
    }, 200);
  }

  function scheduleFlowTransition(delay: number, callback: () => void) {
    clearFlowTimer(flowTimerRef);
    flowTimerRef.current = window.setTimeout(() => {
      flowTimerRef.current = null;
      callback();
    }, delay);
  }

  function waitForFlowDelay(delay: number) {
    return new Promise<void>((resolve) => {
      scheduleFlowTransition(delay, resolve);
    });
  }

  function formatProgressLabel(current: number, total: number) {
    return content.progressLabel
      .replace("{current}", String(current))
      .replace("{total}", String(total));
  }

  function handleStartQuiz() {
    setShowResumePrompt(false);
    setContactError(null);
    transitionTo("step-1");
  }

  function handleResume() {
    setShowResumePrompt(false);
    setContactError(null);
  }

  function handleBack() {
    clearAutoAdvanceTimer(autoAdvanceTimerRef);
    clearFlowTimer(flowTimerRef);
    setContactError(null);

    switch (screen) {
      case "step-2":
        setScreen("step-1");
        return;
      case "step-3":
        setScreen("step-2");
        return;
      case "profile-preview":
        setScreen("step-3");
        return;
      case "step-4":
        setScreen("step-3");
        return;
      case "step-5":
        setScreen("step-4");
        return;
      default:
        return;
    }
  }

  function handleChoiceSelect(stepScreen: ChoiceStepScreen, value: string) {
    const answerKey = getStepAnswerKey(stepScreen);

    if (answerKey === "contact") {
      return;
    }

    setContactError(null);
    setAnswers((current) => ({
      ...current,
      [answerKey]: value,
    }));

    scheduleAutoAdvance(() => {
      if (!isMountedRef.current) {
        return;
      }

      if (stepScreen === "step-1") {
        transitionTo("step-2");
        return;
      }

      if (stepScreen === "step-2") {
        transitionTo("step-3");
        return;
      }

      if (stepScreen === "step-3") {
        if (hasSeenPreviewRef.current) {
          transitionTo("step-4");
          return;
        }

        setHasSeenPreview(true);
        hasSeenPreviewRef.current = true;
        transitionTo("budget-loader");
        scheduleFlowTransition(700, () => {
          if (!isMountedRef.current) {
            return;
          }

          transitionTo("profile-preview");
        });
        return;
      }

      transitionTo("step-5");
    });
  }

  function handlePreviewContinue() {
    transitionTo("step-4");
  }

  function handleContactModeChange(mode: ContactMode) {
    setContactError(null);
    setAnswers((current) => {
      if (current.contactMode === mode) {
        return current;
      }

      return {
        ...current,
        contactMode: mode,
        contactValue: "",
        phoneIntent: undefined,
      };
    });
  }

  function handlePhoneIntentChange(phoneIntent: PhoneIntent) {
    setContactError(null);
    setAnswers((current) => ({
      ...current,
      contactMode: current.contactMode ?? "phone",
      phoneIntent,
    }));
  }

  function handleContactValueChange(value: string) {
    setContactError(null);
    setAnswers((current) => ({
      ...current,
      contactMode: current.contactMode ?? "phone",
      contactValue: value,
    }));
  }

  async function handleSubmit() {
    const contactMode = answers.contactMode ?? "phone";
    const contactValue = answers.contactValue ?? "";
    const normalizedAnswers = normalizeAnswersForContactMode({
      ...answers,
      contactMode,
    });
    const normalizedContact = contactMode === "phone"
      ? normalizePhone(contactValue)
      : normalizeTelegramContact(contactValue);

    if (contactMode === "phone" && !normalizedAnswers.phoneIntent) {
      setContactError(content.questions.contact.phoneIntentError);
      return;
    }

    if (!contactMode || !isValidContact(contactMode, contactValue) || !normalizedContact) {
      setContactError(
        contactMode === "telegram"
          ? content.questions.contact.telegramError
          : content.questions.contact.phoneError
      );
      return;
    }

    const payload: KitchenLeadPayload = {
      answers: {
        ...normalizedAnswers,
        contactMode,
        contactValue: normalizedContact,
      },
      sessionId,
      device: getDeviceKind(),
      timestamp: formatTimestamp(),
      utm,
      quizVersion: QUIZ_VERSION,
      source: QUIZ_SOURCE,
      website,
    };

    submitRunRef.current += 1;
    const submitRunId = submitRunRef.current;

    setContactError(null);
    transitionTo("submit-pending");

    try {
      await Promise.all([sendLead(payload), waitForFlowDelay(700)]);

      if (!isMountedRef.current || submitRunRef.current !== submitRunId) {
        return;
      }

      transitionTo("submit-result");
      scheduleFlowTransition(800, () => {
        if (!isMountedRef.current || submitRunRef.current !== submitRunId) {
          return;
        }

        clearAutoAdvanceTimer(autoAdvanceTimerRef);
        clearFlowTimer(flowTimerRef);
        clearDraftStorage();
        setContactError(null);
        setShowResumePrompt(false);
        setScreen("success");
      });
    } catch {
      if (!isMountedRef.current || submitRunRef.current !== submitRunId) {
        return;
      }

      transitionTo("error-fallback");
    }
  }

  function renderChoiceCard() {
    if (showResumePrompt) {
      return (
        <SurfaceCard>
          <h3 className="text-[clamp(1.75rem,4vw,2.3rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-white">
            {content.resumeTitle}
          </h3>
          <p className="mt-4 max-w-[26rem] text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
            {content.resumeDescription}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleResume} className="button-primary text-sm sm:text-base">
              {content.continueLabel}
            </button>
          </div>
        </SurfaceCard>
      );
    }

    if (screen === "intro") {
      return (
        <SurfaceCard>
          <h3 className="text-[clamp(1.8rem,4vw,2.55rem)] font-semibold leading-[0.96] tracking-[-0.07em] text-white">
            {content.introTitle}
          </h3>
          <p className="mt-4 max-w-[26rem] text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
            {content.introBody}
          </p>
          <button
            type="button"
            onClick={handleStartQuiz}
            className="button-primary mt-6 text-sm sm:text-base"
          >
            {content.introButtonLabel}
          </button>
        </SurfaceCard>
      );
    }

    if (screen === "budget-loader") {
      return <LoaderCard title={content.budgetLoaderTitle} />;
    }

    if (screen === "profile-preview") {
      return (
        <SurfaceCard>
          <h3 className="text-[clamp(1.7rem,4vw,2.25rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-white">
            {content.previewTitle}
          </h3>
          <div className="mt-5 grid gap-3 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <ProfileRow label={content.profileLabels.layout} value={profile.recommendedLayout} />
            <ProfileRow label={content.profileLabels.space} value={profile.spaceLabel} />
            <ProfileRow label={content.profileLabels.budget} value={profile.budgetLabel} />
            {profile.timelineLabel ? (
              <ProfileRow label={content.profileLabels.timeline} value={profile.timelineLabel} />
            ) : null}
          </div>
          {profile.summaryLine ? (
            <p className="mt-5 text-sm leading-6 text-white/76 sm:text-base sm:leading-7">
              {profile.summaryLine}
            </p>
          ) : null}
          {profile.recommendationHint ? (
            <p className="mt-4 text-sm leading-6 text-[var(--color-accent)] sm:text-base sm:leading-7">
              {profile.recommendationHint}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={handleBack} className="button-secondary text-sm sm:text-base">
              {content.previousLabel}
            </button>
            <button type="button" onClick={handlePreviewContinue} className="button-primary text-sm sm:text-base">
              {content.previewButton}
            </button>
          </div>
        </SurfaceCard>
      );
    }

    if (screen === "submit-pending") {
      return <LoaderCard title={content.submitPendingTitle} />;
    }

    if (screen === "submit-result") {
      return <LoaderCard title={content.submitResultTitle} />;
    }

    if (screen === "success") {
      return (
        <StatusCard
          title={content.successTitle}
          description={content.successBody}
          prompt={content.successPrompt}
          buttonLabel={content.successButtonLabel}
          buttonHref={telegramUrl}
        />
      );
    }

    if (screen === "error-fallback") {
      return (
        <StatusCard
          title={content.fallbackTitle}
          description={content.fallbackBody}
          buttonLabel={content.fallbackButtonLabel}
          buttonHref={telegramUrl}
        />
      );
    }

    if (screen === "step-5") {
      const contactMode = answers.contactMode ?? "phone";
      const phoneIntent = contactMode === "phone" ? answers.phoneIntent : undefined;

      return (
        <SurfaceCard>
          <p className="text-sm font-medium text-white/42">{formatProgressLabel(5, 5)}</p>
          <h3 className="mt-3 text-[clamp(1.55rem,4vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
            {content.contactTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-accent)] sm:text-base sm:leading-7">
            {content.contactHint}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {(["phone", "telegram"] as const).map((mode) => {
              const label = mode === "phone"
                ? content.questions.contact.phoneLabel
                : content.questions.contact.telegramLabel;
              const active = contactMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleContactModeChange(mode)}
                  className={`rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "border-[rgba(222,214,199,0.38)] bg-[rgba(222,214,199,0.12)] text-white"
                      : "border-white/8 bg-white/3 text-white/62 hover:border-white/16 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="sr-only">{content.contactTitle}</span>
            <input
              type={contactMode === "phone" ? "tel" : "text"}
              value={answers.contactValue ?? ""}
              onChange={(event) => handleContactValueChange(event.target.value)}
              placeholder={
                contactMode === "phone"
                  ? content.questions.contact.phonePlaceholder
                  : content.questions.contact.telegramPlaceholder
              }
              className="w-full rounded-[1.2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-base text-white outline-none transition-colors duration-200 placeholder:text-white/26 focus:border-[rgba(222,214,199,0.32)]"
            />
          </label>

          {contactMode === "phone" ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
                {content.questions.contact.phoneIntentTitle}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([
                  ["call", content.questions.contact.phoneIntentCallLabel],
                  ["message", content.questions.contact.phoneIntentMessageLabel],
                ] as const).map(([value, label]) => {
                  const active = phoneIntent === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePhoneIntentChange(value)}
                      className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                        active
                          ? "border-[rgba(222,214,199,0.38)] bg-[rgba(222,214,199,0.12)] text-white"
                          : "border-white/8 bg-white/3 text-white/62 hover:border-white/16 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {contactError ? (
            <p className="mt-3 text-sm leading-6 text-white/48">{contactError}</p>
          ) : null}

          <div className="sr-only" aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={handleBack} className="button-secondary text-sm sm:text-base">
              {content.previousLabel}
            </button>
            <button type="button" onClick={handleSubmit} className="button-primary text-sm sm:text-base">
              {content.questions.contact.submitLabel}
            </button>
          </div>
        </SurfaceCard>
      );
    }

    if (!isChoiceStep(screen)) {
      return null;
    }

    const question = getChoiceQuestion(screen, content);
    const answerKey = getChoiceAnswerKey(screen);
    const selectedValue = answers[answerKey];
    const currentStepNumber = getStepNumber(screen);

    return (
      <SurfaceCard>
        <p className="text-sm font-medium text-white/42">{formatProgressLabel(currentStepNumber, 5)}</p>
        <h3 className="mt-3 text-[clamp(1.55rem,4vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
          {question.title}
        </h3>

        <div className="mt-5 grid gap-3">
          {question.options.map((option) => {
            const active = selectedValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChoiceSelect(screen, option.value)}
                className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm leading-6 transition-colors duration-200 sm:text-base ${
                  active
                    ? "border-[rgba(222,214,199,0.38)] bg-[rgba(222,214,199,0.12)] text-white"
                    : "border-white/8 bg-white/3 text-white/62 hover:border-white/16 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={handleBack}
            disabled={screen === "step-1"}
            className="button-secondary text-sm disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
          >
            {content.previousLabel}
          </button>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,22,29,0.98),rgba(9,12,16,0.94))] shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,214,199,0.12),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.12fr)] lg:gap-6">
        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,29,0.9),rgba(10,13,17,0.88))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:p-6">
          <p className="text-sm leading-6 text-white/56 sm:text-base sm:leading-7">
            {content.missionLabel}
          </p>

          <div className="mt-6">
            <ProgressBar progressValue={progressValue} />
            {showProgressLabel ? (
              <p className="mt-3 text-sm font-medium text-white/42">
                {formatProgressLabel(stepNumber, 5)}
              </p>
            ) : null}
          </div>

          <div className="mt-6 rounded-[1.55rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="grid gap-3">
              <ProfileRow label={content.profileLabels.layout} value={profile.recommendedLayout} />
              <ProfileRow label={content.profileLabels.space} value={profile.spaceLabel} />
              <ProfileRow label={content.profileLabels.budget} value={profile.budgetLabel} />
              <ProfileRow
                label={content.profileLabels.timeline}
                value={profile.timelineLabel ?? "Пока без срока"}
              />
            </div>

            {profile.recommendationHint ? (
              <div className="mt-4 border-t border-white/8 pt-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/32">
                  {content.profileLabels.recommendation}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">{profile.recommendationHint}</p>
              </div>
            ) : null}
          </div>

          {showSocialProof ? (
            <p className="mt-4 text-sm leading-6 text-[var(--color-accent)]">
              {content.socialProof}
            </p>
          ) : null}
        </aside>

        <div>{renderChoiceCard()}</div>
      </div>
    </div>
  );
}

function SurfaceCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,29,0.94),rgba(10,13,17,0.92))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6">
      {children}
    </div>
  );
}

function ProgressBar({ progressValue }: { progressValue: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/8">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(222,214,199,0.45),rgba(222,214,199,0.9))] transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: progressValue }}
      />
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs uppercase tracking-[0.28em] text-white/32">{label}</p>
      <p className="text-right text-sm leading-6 text-white/74">{value}</p>
    </div>
  );
}

function LoaderCard({ title }: { title: string }) {
  return (
    <SurfaceCard>
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-accent)]" />
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(222,214,199,0.52),transparent)]" />
      </div>
      <p className="mt-6 max-w-[24rem] text-[clamp(1.55rem,4vw,2.1rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
        {title}
      </p>
    </SurfaceCard>
  );
}

function StatusCard({
  title,
  description,
  prompt,
  buttonLabel,
  buttonHref,
}: {
  title: string;
  description: string;
  prompt?: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <SurfaceCard>
      <h3 className="text-[clamp(1.7rem,4vw,2.3rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-white">
        {title}
      </h3>
      <p className="mt-4 max-w-[28rem] text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
        {description}
      </p>
      {prompt ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-accent)] sm:text-base sm:leading-7">
          {prompt}
        </p>
      ) : null}
      <Link
        href={buttonHref}
        target="_blank"
        rel="noreferrer"
        className="button-primary mt-6 text-sm sm:text-base"
      >
        {buttonLabel}
      </Link>
    </SurfaceCard>
  );
}

function clearDraftStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(QUIZ_DRAFT_KEY);
  }
}

function clearHydrateTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function clearAutoAdvanceTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function clearFlowTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function isChoiceStep(screen: QuizScreen): screen is ChoiceStepScreen {
  return screen === "step-1" || screen === "step-2" || screen === "step-3" || screen === "step-4";
}

function getChoiceQuestion(screen: ChoiceStepScreen, content: QuizContent) {
  switch (screen) {
    case "step-1":
      return content.questions.kitchenType;
    case "step-2":
      return content.questions.kitchenSize;
    case "step-3":
      return content.questions.budget;
    case "step-4":
      return content.questions.timeline;
  }
}

function getChoiceAnswerKey(screen: ChoiceStepScreen) {
  switch (screen) {
    case "step-1":
      return "kitchenType" as const;
    case "step-2":
      return "kitchenSize" as const;
    case "step-3":
      return "budget" as const;
    case "step-4":
      return "timeline" as const;
  }
}

function readStoredDraft() {
  try {
    const raw = window.localStorage.getItem(QUIZ_DRAFT_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<KitchenQuizDraft>;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      currentScreen: isQuizScreenValue(parsed.currentScreen) ? parsed.currentScreen : "intro",
      answers: parsed.answers ?? {},
      sessionId: parsed.sessionId ?? "",
      utm: parsed.utm ?? {},
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : "",
      hasSeenPreview: Boolean(parsed.hasSeenPreview),
    } satisfies KitchenQuizDraft;
  } catch {
    return null;
  }
}

function isQuizScreenValue(value: unknown): value is QuizScreen {
  return [
    "intro",
    "step-1",
    "step-2",
    "step-3",
    "budget-loader",
    "profile-preview",
    "step-4",
    "step-5",
    "submit-pending",
    "submit-result",
    "success",
    "error-fallback",
  ].includes(String(value));
}

async function sendLead(payload: KitchenLeadPayload) {
  const response = await fetch("/api/quiz-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead submit failed");
  }
}

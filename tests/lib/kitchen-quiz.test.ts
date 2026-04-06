import { describe, expect, it } from "vitest";

import {
  createQuizDraft,
  hasStoredAnswers,
  normalizeStoredDraft,
  type KitchenQuizDraft,
} from "@/lib/kitchen-quiz";

function makeDraft(overrides: Partial<KitchenQuizDraft> = {}): KitchenQuizDraft {
  const baseDraft = createQuizDraft("?utm_source=test");

  return {
    ...baseDraft,
    ...overrides,
    answers: {
      ...baseDraft.answers,
      ...overrides.answers,
    },
    utm: {
      ...baseDraft.utm,
      ...overrides.utm,
    },
  };
}

describe("kitchen quiz draft behavior", () => {
  it("creates a truly empty draft by default", () => {
    const draft = createQuizDraft("?utm_source=test");

    expect(draft.currentScreen).toBe("intro");
    expect(draft.answers).toEqual({});
    expect(draft.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("does not treat a bare contact mode as stored progress", () => {
    const draft = makeDraft({
      currentScreen: "step-5",
      answers: {
        contactMode: "phone",
      },
    });

    expect(hasStoredAnswers(draft)).toBe(false);
  });

  it("normalizes old false-positive contact drafts back to the fallback intro state", () => {
    const fallbackDraft = createQuizDraft("?utm_source=restored");
    const storedDraft = makeDraft({
      currentScreen: "step-5",
      answers: {
        contactMode: "phone",
        phoneIntent: "call",
      },
      hasSeenPreview: true,
    });

    const normalized = normalizeStoredDraft(storedDraft, fallbackDraft);

    expect(normalized).toEqual(fallbackDraft);
  });

  it("keeps real progress while dropping orphan phone intent and restoring a stable screen", () => {
    const fallbackDraft = createQuizDraft("?utm_source=restored");
    const storedDraft = makeDraft({
      currentScreen: "submit-result",
      answers: {
        kitchenType: "corner",
        kitchenSize: "2to3",
        budget: "100to200",
        timeline: "month",
        contactMode: "telegram",
        contactValue: "@kitchen_client",
        phoneIntent: "call",
      },
      hasSeenPreview: true,
    });

    const normalized = normalizeStoredDraft(storedDraft, fallbackDraft);

    expect(normalized.currentScreen).toBe("step-5");
    expect(normalized.answers.phoneIntent).toBeUndefined();
    expect(normalized.answers.contactMode).toBe("telegram");
    expect(normalized.answers.contactValue).toBe("@kitchen_client");
    expect(hasStoredAnswers(normalized)).toBe(true);
  });
});

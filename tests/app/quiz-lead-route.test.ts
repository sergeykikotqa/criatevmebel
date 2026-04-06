import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/quiz-lead/route";

type MockRequestOptions = {
  body?: string;
  headers?: Record<string, string>;
  url?: string;
};

function createMockRequest(options: MockRequestOptions = {}) {
  const {
    body = "{}",
    headers = {},
    url = "https://kitchen.example/api/quiz-lead",
  } = options;

  return {
    headers: new Headers(headers),
    url,
    text: async () => body,
  } as Request;
}

describe("POST /api/quiz-lead hardening", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 415 for a non-JSON content type", async () => {
    const response = await POST(createMockRequest({
      headers: {
        "content-type": "text/plain",
        "x-forwarded-for": "198.51.100.10",
      },
    }));

    expect(response.status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 413 before reading the body when content-length exceeds 8 KB", async () => {
    const response = await POST(createMockRequest({
      body: "{}",
      headers: {
        "content-type": "application/json",
        "content-length": "9000",
        "x-forwarded-for": "198.51.100.11",
      },
    }));

    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 413 after reading the body when byte size exceeds 8 KB", async () => {
    const oversizedBody = JSON.stringify({
      website: "",
      payload: "x".repeat(9000),
    });

    const response = await POST(createMockRequest({
      body: oversizedBody,
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.12",
      },
    }));

    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 403 for a cross-origin submit", async () => {
    const response = await POST(createMockRequest({
      headers: {
        "content-type": "application/json",
        origin: "https://evil.example",
        "x-forwarded-for": "198.51.100.13",
      },
    }));

    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts application/json with charset and short-circuits honeypot submits with 204", async () => {
    const response = await POST(createMockRequest({
      body: JSON.stringify({
        website: "spam-field",
      }),
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-forwarded-for": "198.51.100.14",
      },
    }));

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 429 after repeated attempts from the same first forwarded IP", async () => {
    const attempts = Array.from({ length: 6 }, (_, index) =>
      POST(createMockRequest({
        body: JSON.stringify({
          website: "spam-field",
        }),
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": `198.51.100.15, 203.0.113.${index + 1}`,
        },
      }))
    );

    const responses = await Promise.all(attempts);

    expect(responses.slice(0, 5).map((response) => response.status)).toEqual([204, 204, 204, 204, 204]);
    expect(responses[5]?.status).toBe(429);
    expect(fetch).not.toHaveBeenCalled();
  });
});

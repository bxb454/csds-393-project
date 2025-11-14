import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GenerateThemeRequest, GeneratedTheme } from "../llm/types";

const capturedKeys: string[] = [];
const capturedModelConfigs: any[] = [];
const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  class MockGoogleGenerativeAI {
    key: string;
    constructor(key: string) {
      this.key = key;
      capturedKeys.push(key);
    }

    getGenerativeModel(config: any) {
      capturedModelConfigs.push(config);
      return { generateContent: mockGenerateContent };
    }
  }

  return { GoogleGenerativeAI: MockGoogleGenerativeAI };
});

import { LlmClient } from "../llm/client";

function makeTheme(): { theme: GeneratedTheme } {
  return {
    theme: {
      colors: {
        primary: { r: 1, g: 2, b: 3, a: 1 },
        secondary: { r: 4, g: 5, b: 6, a: 1 },
        accent: { r: 7, g: 8, b: 9, a: 1 },
        background: { r: 10, g: 11, b: 12, a: 1 },
        foreground: { r: 13, g: 14, b: 15, a: 1 }
      },
      backgroundImageDataUrl: "data:image/png;base64,AAAA"
    }
  };
}

function makeRequest(overrides: Partial<GenerateThemeRequest> = {}): GenerateThemeRequest {
  return {
    albumOrPlaylistName: "Random Theme",
    albumArtBase64: "",
    userContext: { genres: [] },
    ...overrides
  };
}

beforeEach(() => {
  capturedKeys.length = 0;
  capturedModelConfigs.length = 0;
  mockGenerateContent.mockReset();
});

describe("Theme.Generate / LLM_C-Init", () => {
  it("uses the default Gemini model when no factory is provided", async () => {
    mockGenerateContent.mockResolvedValueOnce({ response: { text: () => JSON.stringify(makeTheme()) } });
    const client = new LlmClient();
    client.setApiKey("test-key");

    await client.generateTheme(makeRequest());

    expect(capturedKeys).toEqual(["test-key"]);
    expect(capturedModelConfigs).toHaveLength(1);
    expect(capturedModelConfigs[0].model).toBe("gemini-2.5-flash");
    expect(capturedModelConfigs[0].generationConfig.responseMimeType).toBe("application/json");
  });
});

describe("Theme.Generate / LLM_C-GenerateTheme", () => {
  it("handles zero optional inputs", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { response: { text: () => JSON.stringify(makeTheme()) } };
    });

    const client = new LlmClient();
    client.setApiKey("k-zero");
    const result = await client.generateTheme(makeRequest());

    expect(result).toEqual(makeTheme());
    expect(capturedPayload.contents[0].parts).toHaveLength(1);
    expect(capturedPayload.contents[0].parts[0].text).toContain("Genres=none");
  });

  it("handles a single genre with inline album art", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { response: { text: () => JSON.stringify(makeTheme()) } };
    });

    const client = new LlmClient();
    client.setApiKey("k-one");
    await client.generateTheme(
      makeRequest({
        albumOrPlaylistName: "Solo",
        albumArtBase64: "data:image/png;base64,QUJD",
        userContext: { genres: ["lofi"] }
      })
    );

    const parts = capturedPayload.contents[0].parts;
    expect(parts).toHaveLength(2);
    expect(parts[0].text).toContain("Genres=lofi");
    expect(parts[1].inlineData.mimeType).toBe("image/png");
    expect(parts[1].inlineData.data).toBe("QUJD");
  });

  it("handles many genres", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { response: { text: () => JSON.stringify(makeTheme()) } };
    });

    const client = new LlmClient();
    client.setApiKey("k-many");
    await client.generateTheme(
      makeRequest({
        userContext: { genres: ["jazz", "funk", "soul"] }
      })
    );

    expect(capturedPayload.contents[0].parts[0].text).toContain("Genres=jazz, funk, soul");
  });
});

describe("Theme.Generate / LLM_C-BuildPrompt", () => {
  it("produces a prompt with defaults when context is missing", () => {
    const prompt = LlmClient.buildPrompt({});
    expect(prompt).toContain('Album/Playlist="Unknown"');
    expect(prompt).toContain("Genres=none");
  });

  it("includes a single genre", () => {
    const prompt = LlmClient.buildPrompt({ albumOrPlaylistName: "Only One", userContext: { genres: ["ambient"] } });
    expect(prompt).toContain('Album/Playlist="Only One"');
    expect(prompt).toContain("Genres=ambient");
  });

  it("lists many genres in order", () => {
    const prompt = LlmClient.buildPrompt({ userContext: { genres: ["metal", "jazz", "pop"] } });
    expect(prompt).toContain("Genres=metal, jazz, pop");
  });
});
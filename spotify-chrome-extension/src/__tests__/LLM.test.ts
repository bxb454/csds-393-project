import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GenerateThemeRequest, GeneratedTheme } from "../llm/types";

const capturedKeys: string[] = [];
const capturedModelConfigs: any[] = [];
const mockGenerateContent = vi.fn();

/*
NOTE: EACH TEST, WHERE APPLICABLE, USES "ZERO, ONE MANY" TEST PHILOSOPHY FOR UNIT TESTING.
*/


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

//just a mock implementation
//make all optional with Partial so tests can override what they want
function makeRequest(overrides: Partial<GenerateThemeRequest> = {}): GenerateThemeRequest {
  return {
    albumOrPlaylistName: "Random Theme",
    albumArtBase64: "",
    userContext: { genres: [] },
    ...overrides
  };
}

//reset the mocks before each test
beforeEach(() => {
  capturedKeys.length = 0;
  capturedModelConfigs.length = 0;
  mockGenerateContent.mockReset();
});

//Describe the test suite for initializing the LLM Client
describe("Theme.Generate / LLM_C-Init", () => {
  it("uses the default Gemini model when no factory is provided", async () => {
    mockGenerateContent.mockResolvedValueOnce({ 
      response: { 
        candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
        text: () => JSON.stringify(makeTheme()) 
      } 
    });
    const client = new LlmClient();
    client.setApiKey("test-key");

    await client.generateTheme(makeRequest());

    expect(capturedKeys).toEqual(["test-key"]);
    expect(capturedModelConfigs).toHaveLength(1);
    expect(capturedModelConfigs[0].model).toBe("gemini-2.5-flash");
    expect(capturedModelConfigs[0].generationConfig.responseMimeType).toBe("application/json");
  });

  it("should initialize with correct generation config settings", async () => {
    mockGenerateContent.mockResolvedValueOnce({ 
      response: { 
        candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
        text: () => JSON.stringify(makeTheme()) 
      } 
    });
    const client = new LlmClient();
    client.setApiKey("test-key");

    await client.generateTheme(makeRequest());

    expect(capturedModelConfigs[0].generationConfig.temperature).toBe(0.2);
    expect(capturedModelConfigs[0].generationConfig.maxOutputTokens).toBe(4096);
  });
});

//Describe the test suite for generating LLM themes
describe("Theme.Generate / LLM_C-GenerateTheme", () => {
  it("handles zero optional inputs", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { 
        response: { 
          candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
          text: () => JSON.stringify(makeTheme()) 
        } 
      };
    });

    const client = new LlmClient();
    client.setApiKey("key-zero");
    const result = await client.generateTheme(makeRequest());

    expect(result).toEqual(makeTheme());
    expect(capturedPayload.contents[0].parts).toHaveLength(1);
    expect(capturedPayload.contents[0].parts[0].text).toContain("Genres=none");
  });

  it("handles a single genre with inline album art", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { 
        response: { 
          candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
          text: () => JSON.stringify(makeTheme()) 
        } 
      };
    });

    const client = new LlmClient();
    client.setApiKey("key-one");
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
      return { 
        response: { 
          candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
          text: () => JSON.stringify(makeTheme()) 
        } 
      };
    });

    const client = new LlmClient();
    client.setApiKey("key-many");
    await client.generateTheme(
      makeRequest({
        userContext: { genres: ["jazz", "funk", "soul"] }
      })
    );

    expect(capturedPayload.contents[0].parts[0].text).toContain("Genres=jazz, funk, soul");
  });

  it("should throw error if API key is not set", async () => {
    const client = new LlmClient();
    
    await expect(client.generateTheme(makeRequest())).rejects.toThrow("GEMINI_API_KEY_REQUIRED");
  });

  it("should correctly format request payload with user context", async () => {
    let capturedPayload: any;
    mockGenerateContent.mockImplementationOnce(async (payload: unknown) => {
      capturedPayload = payload;
      return { 
        response: { 
          candidates: [{ content: { parts: [{ text: JSON.stringify(makeTheme()) }] } }],
          text: () => JSON.stringify(makeTheme()) 
        } 
      };
    });

    const client = new LlmClient();
    client.setApiKey("k-context");
    await client.generateTheme(
      makeRequest({
        albumOrPlaylistName: "Test Album",
        userContext: { genres: ["pop", "rock"] }
      })
    );

    expect(capturedPayload.contents).toBeDefined();
    expect(capturedPayload.contents[0].role).toBe("user");
    expect(capturedPayload.contents[0].parts).toBeDefined();
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

  it("includes time context when provided", () => {
    const prompt = LlmClient.buildPrompt({ userContext: { genres: ["rock"], timeOfDay: "evening" } });
    expect(prompt).toContain("Time=evening");
  });

  it("returns properly formatted string with instruction guidelines", () => {
    const prompt = LlmClient.buildPrompt({ albumOrPlaylistName: "Test", userContext: { genres: ["pop"] } });
    expect(prompt).toContain("You generate Chrome themes from album art");
    expect(prompt).toContain("Return strict JSON");
    expect(prompt).toContain("Ensure readable contrast");
  });
});

describe("Theme.Generate / LLM_C-ImagePart", () => {
  it("should correctly convert data URL to inlineData format with correct MIME type", () => {
    const dataUrl = "data:image/png;base64,ABCD1234";
    const part = LlmClient.toImagePart(dataUrl);
    
    expect(part.inlineData).toBeDefined();
    expect(part.inlineData.mimeType).toBe("image/png");
    expect(part.inlineData.data).toBe("ABCD1234");
  });

  it("should handle JPEG images", () => {
    const dataUrl = "data:image/jpeg;base64,JPEGDATA";
    const part = LlmClient.toImagePart(dataUrl);
    
    expect(part.inlineData.mimeType).toBe("image/jpeg");
    expect(part.inlineData.data).toBe("JPEGDATA");
  });

  it("should handle base64-only input (no data: prefix)", () => {
    const base64Data = "ABCD1234";
    const part = LlmClient.toImagePart(base64Data);
    
    expect(part.inlineData).toBeDefined();
    // When no prefix, defaults to image/png
    expect(part.inlineData.mimeType).toBe("image/png");
    expect(part.inlineData.data).toBe("ABCD1234");
  });

  it("should default to image/png when MIME type cannot be determined", () => {
    const part = LlmClient.toImagePart("some-base64-data");
    expect(part.inlineData.mimeType).toBe("image/png");
  });
});

/**
 * LLM Theming Service Tests
 * 
 * These tests cover the LLMTheming module which handles:
 * - Token management (LLM_T-GetToken)
 * - Playlist listing and retrieval (LLM_T-ListPlaylists)
 * - Playlist art retrieval (LLM_T-GetArt)
 * - Album discovery (LLM_T-FindAlbum)
 * - Currently playing art retrieval (LLM_T-CurrPlayingArt)
 * - Theme generation from album art (LLM_T-GenThemeFromArt)
 * - Random theme generation with fallback (LLM_T-GenRandomTheme)
 * - Error handling (LLM_T-ErrorsHelper)
 */

describe("LLM Theming / LLM_T-GetToken", () => {
  // TODO: Requires LLMTheming module with getAccessToken() function
  // This function should retrieve OAuth token from Chrome storage
  it.todo("should retrieve OAuth access token from chrome.storage.local")
  it.todo("should return token as Promise")
  it.todo("should handle missing token gracefully with error")
  it.todo("should handle corrupted token in storage")
})

describe("LLM Theming / LLM_T-ListPlaylists", () => {
  // TODO: Requires LLMTheming.listPlaylists() function
  // Should fetch paginated playlist data from Spotify API
  it.todo("should fetch user playlists from Spotify API")
  it.todo("should handle pagination of playlist results")
  it.todo("should return list of playlist names")
  it.todo("should handle API errors gracefully")
})

describe("LLM Theming / LLM_T-GetArt", () => {
  // TODO: Requires LLMTheming.getPlaylistArt() function
  // Should find playlist by name and return its cover image art
  it.todo("should find playlist by name")
  it.todo("should extract image URL from playlist metadata")
  it.todo("should return image URL for the specified playlist")
  it.todo("should handle case-insensitive playlist name matching")
  it.todo("should throw error if playlist not found")
})

describe("LLM Theming / LLM_T-FindAlbum", () => {
  // TODO: Requires LLMTheming.findAlbum() function
  // Should search for albums by name and return art URL
  it.todo("should search Spotify API for album by name")
  it.todo("should return album image URL")
  it.todo("should return the first match from search results")
  it.todo("should handle multiple albums with same name")
  it.todo("should throw error if album not found")
})

describe("LLM Theming / LLM_T-CurrPlayingArt", () => {
  // TODO: Requires LLMTheming.getCurrentlyPlayingArt() function
  // Should retrieve album art for currently playing track
  it.todo("should retrieve currently playing track metadata")
  it.todo("should extract album art URL from track data")
  it.todo("should return 204 No Content if nothing is playing")
  it.todo("should return album art URL when track is playing")
  it.todo("should handle API errors with custom SPOTIFY_ERROR")
})

describe("LLM Theming / LLM_T-GenThemeFromArt", () => {
  // TODO: Requires LLMTheming.generateThemeFromArt() function
  // Should convert image BLOB/URL to theme using LLM
  it.todo("should convert image BLOB to data URL")
  it.todo("should send image to LLM for theme generation")
  it.todo("should return GeneratedTheme object on success")
  it.todo("should return fallback default theme on LLM error")
  it.todo("should handle various image formats (PNG, JPEG, WebP)")
  it.todo("should throw custom LLM_ERROR on failure")
})

describe("LLM Theming / LLM_T-GenRandomTheme", () => {
  // TODO: Requires LLMTheming.generateRandomTheme() function
  // Should generate theme from LLM with fallback to default
  it.todo("should call LLM client to generate theme")
  it.todo("should return GeneratedTheme on successful generation")
  it.todo("should return fallback default theme if LLM fails")
  it.todo("should not throw exception on LLM error")
  it.todo("should log error when LLM generation fails")
})

describe("LLM Theming / LLM_T-ErrorsHelper", () => {
  // TODO: Requires Errors.make() helper function
  // Should wrap error messages in proper Error object
  it.todo("should create Error object with provided message")
  it.todo("should preserve error message in output")
  it.todo("should handle various error types")
})

/**
 * CSS Theme Injector Tests
 * 
 * These tests cover theme injection functionality:
 * - THM_T-Def: Verify predefined themes exist and are valid
 * - THM_T-Chng: Verify theme changes when update is called
 */

describe("CSS Theme Injector / THM_T-Def", () => {
  // TODO: Requires theme injection module with predefined themes
  // Should verify that predefined themes are properly defined and valid
  it.todo("should have predefined theme objects available")
  it.todo("should verify all predefined themes have required color properties")
  it.todo("should verify primary, secondary, accent, background, foreground colors exist")
  it.todo("should load predefined themes without errors")
})

describe("CSS Theme Injector / THM_T-Chng", () => {
  // TODO: Requires theme update functionality in content script/main extension
  // Should verify that theme CSS variables are updated properly
  it.todo("should update CSS variables when applyTheme() is called")
  it.todo("should apply theme when currently playing track changes")
  it.todo("should apply theme when user selects preset playlist")
  it.todo("should update browser colors smoothly without visual glitches")
  it.todo("should handle theme application errors gracefully")
})
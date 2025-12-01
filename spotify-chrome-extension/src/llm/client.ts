import type {
  GenerateThemeRequest,
  GeneratedTheme,
} from "./types";

import { GoogleGenerativeAI, type GenerativeModel, type Part } from "@google/generative-ai";

export type ModelFactory = (apiKey: string) => GenerativeModel;

export class LlmClient {
  private apiKey?: string | null;
  private model?: GenerativeModel;
  private readonly createModel: ModelFactory;

  constructor(factory?: ModelFactory) {
    this.createModel = factory ?? ((key) => {
      const genAI = new GoogleGenerativeAI(key);
      return genAI.getGenerativeModel({
        model: "gemini-2.5-flash", 
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
    });
  }

  static buildPrompt(input: { 
    albumOrPlaylistName?: string | null; 
    userContext?: GenerateThemeRequest["userContext"] 
  }) {
    const name = input.albumOrPlaylistName?.trim() || "Unknown";
    const genres = input.userContext?.genres?.length 
      ? input.userContext.genres.join(", ") 
      : "none";
    
    // Shorter, more direct prompt
    return `Generate a Chrome theme as JSON. Context: Album="${name}", Genres=${genres}.

Required JSON structure:
{
  "theme": {
    "colors": {
      "primary": {"r": 0-255, "g": 0-255, "b": 0-255, "a": 1},
      "secondary": {"r": 0-255, "g": 0-255, "b": 0-255, "a": 1},
      "accent": {"r": 0-255, "g": 0-255, "b": 0-255, "a": 1},
      "background": {"r": 0-255, "g": 0-255, "b": 0-255, "a": 1},
      "foreground": {"r": 0-255, "g": 0-255, "b": 0-255, "a": 1}
    },
    "backgroundImageDataUrl": ""
  }
}

Rules:
- Extract colors from the album art
- Ensure high contrast between background and foreground (WCAG AA: 4.5:1 minimum)
- Leave backgroundImageDataUrl empty
- Return ONLY the JSON, no explanations`;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    this.model = undefined;
  }

  static buildPromptParts(req: GenerateThemeRequest): Part[] {
    const instructions = LlmClient.buildPrompt({
      albumOrPlaylistName: req.albumOrPlaylistName,
      userContext: req.userContext
    });
    const parts: Part[] = [{ text: instructions }];
    
    if (req.albumArtBase64) {
      parts.push(LlmClient.toImagePart(req.albumArtBase64));
    }
    
    return parts;
  }

  static toImagePart(dataUrlOrBase64: string) {
    const hasPrefix = dataUrlOrBase64.startsWith("data:");
    if (hasPrefix) {
      const match = dataUrlOrBase64.match(/^data:(.+?);base64,(.*)$/);
      const mimeType = match?.[1] ?? "image/png";
      const data = match?.[2] ?? dataUrlOrBase64.split(",")[1] ?? "";
      return { inlineData: { mimeType, data } };
    }
    return { inlineData: { mimeType: "image/png", data: dataUrlOrBase64 } };
  }

  // Resize image to reduce processing time
  static async resizeImage(dataUrl: string, maxSize: number = 512): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if too large
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // JPEG at 80% quality
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  async generateTheme(req: GenerateThemeRequest): Promise<{ theme: GeneratedTheme }> {
    console.time("[LlmClient] Total generation time");
    
    if (!this.apiKey) throw new Error("GEMINI_API_KEY_REQUIRED");
    this.model ??= this.createModel(this.apiKey);

    // Resize image if present to speed up processing
    if (req.albumArtBase64) {
      console.time("[LlmClient] Image resize");
      req.albumArtBase64 = await LlmClient.resizeImage(req.albumArtBase64, 512);
      console.timeEnd("[LlmClient] Image resize");
    }

    const parts = LlmClient.buildPromptParts(req);
    
    console.time("[LlmClient] API call");
    const result = await this.model.generateContent({ 
      contents: [{ role: "user", parts }]
    });
    console.timeEnd("[LlmClient] API call");

    console.log("[LlmClient] Raw response:", result);

    const candidateText = result.response.candidates?.[0];
    if (!candidateText) {
      throw new Error("No candidates returned from LLM");
    }

    const json = result.response.text();
    console.log("[LlmClient] Parsed JSON:", json);
    
    console.timeEnd("[LlmClient] Total generation time");
    
    return JSON.parse(json) as { theme: GeneratedTheme };
  }
}
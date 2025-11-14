import type {
  GenerateThemeRequest,
  //GenerateThemeResponse,
  GeneratedTheme,
  //ApiError,
} from "./types";

import { GoogleGenerativeAI, type GenerativeModel,
  type Part} from "@google/generative-ai";


/**
 * LlmClient talks directly to Gemini's ORIGINAL REST paths using the GenAI Typescript SDK found here:
 * https://www.npmjs.com/package/@google/generative-ai
 */

//This is a "factory" type that creates a GenerativeModel from an API key.
export type ModelFactory = (apiKey: string) => GenerativeModel;

export class LlmClient {
  private apiKey?: string | null;
  private model?: GenerativeModel;
  //BASE URL as shown in REST-style requests from gemini's API documentation
  private readonly createModel: ModelFactory;

  constructor(factory?: ModelFactory) {
    this.createModel = factory ?? ((key) => {
      const genAI = new GoogleGenerativeAI(key);
      return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          //json output
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      });
    });
  }

  static buildPrompt(input: { albumOrPlaylistName?: string | null; userContext?: GenerateThemeRequest["userContext"] }) {
    const name = input.albumOrPlaylistName?.trim() || "Unknown";
    const genres = input.userContext?.genres?.length ? input.userContext.genres.join(", ") : "none";
    const extras = [`Album/Playlist="${name}"`, `Genres=${genres}`];
    if (input.userContext?.timeOfDay) extras.push(`Time=${input.userContext.timeOfDay}`);
    if (input.userContext?.weather) extras.push(`Weather=${input.userContext.weather}`);
    return [
      "You generate Chrome themes from album art.",
      "Return strict JSON with shape:",
      `{"theme":{"colors":{"primary":{"r":0-255,"g":0-255,"b":0-255,"a":0-1},"secondary":{...},"accent":{...},"background":{...},"foreground":{...}},"backgroundImageDataUrl":"data:image/png;base64,..."}}.`,
      "Ensure readable contrast between foreground and background.",
      `Context: ${extras.join("; ")}`
    ].join("\n");
  }

  setApiKey(key: string) {
    this.apiKey = key;
    this.model = undefined;
  }


  /*private ensureKey(): string {
    if (!this.apiKey) throw new Error("Gemini API key not set. call setApiKey() first.");
    return this.apiKey;
  }*/

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

  //non stream theme generation
  async generateTheme(req: GenerateThemeRequest): Promise<{ theme: GeneratedTheme }> {
    if (!this.apiKey) throw new Error("GEMINI_API_KEY_REQUIRED");
    this.model ??= this.createModel(this.apiKey);

    const parts = LlmClient.buildPromptParts(req);
    const result = await this.model.generateContent({ contents: [{ role: "user", parts }] });


    //bug here: gemini is being stupid and always creating responses above token limit
    //response.candidates, an array of responses by gemini

    console.log("LLM raw output:", result);

    const candidateText = result.response.candidates?.[0];
    console.log("LLM candidate output:", candidateText);
    if (!candidateText) {
      throw new Error("No candidates returned from LLM");
    }

    alert("LLM raw output: \n" + JSON.stringify(result));

    const json = result.response.text();
    return JSON.parse(json) as { theme: GeneratedTheme };
  }
}

//helper functions for ease of use and easier code readability.

/*
function buildPrompt(user?: { genres?: string[]; timeOfDay?: string; weather?: string }) {
  const ctx: string[] = [];
  if (user?.genres?.length) ctx.push(`Genres: ${user.genres.join(", ")}`);
  if (user?.timeOfDay) ctx.push(`Time: ${user.timeOfDay}`);
  if (user?.weather) ctx.push(`Weather: ${user.weather}`);


  //base prompt is here, can be tweaked later on and refined.

  return [
    "You generate Chrome themes from album art.",
    "Return strict JSON with shape:",
    `{
      "theme": {
        "colors": {
          "primary": {"r":0-255,"g":0-255,"b":0-255,"a":0-1},
          "secondary": {"r":...},
          "accent": {"r":...},
          "background": {"r":...},
          "foreground": {"r":...}
        },
        "backgroundImageDataUrl": "data:image/png;base64,..."
      }
    }`,
    "Ensure readable contrast between foreground and background.",
    ctx.length ? `Context: ${ctx.join(" | ")}` : "",
  ].filter(Boolean).join("\n");
}
*/

/* i dont need these anymore
//convert data URL to inline image data (base64 encoded)
/*function toImagePart(dataUrl: string) {
    //regex parsing to match a typical MIME type for data representation
  const match_data = dataUrl.match(/^data:(.+?);base64,/)?.[1] ?? "image/png";
  const data = dataUrl.split(",")[1]!;
  return { inlineData: { matchType: match_data, data } };
}

function extractText(out: any): string {
  //typical: candidates[0].content.parts[].text
  return (
    out?.candidates?.[0]?.content?.parts?.find((p: any) => typeof p.text === "string")?.text ??
    out?.candidates?.[0]?.output_text ??
    ""
  );
}

//parse theme string to get colors
function parseAndValidateTheme(text: string) {
  const obj = JSON.parse(text);
  const theme = obj.theme ?? obj;
  for (const k of ["primary", "secondary", "accent", "background", "foreground"]) {
    if (!theme?.colors?.[k]) throw new Error(`Missing colors.${k}`);
  }
  return theme;
}*/

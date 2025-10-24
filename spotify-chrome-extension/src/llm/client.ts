import type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ApiError,
} from "./types";

/**
 * LlmClient talks directly to Gemini's ORIGINAL REST paths (server-side preferred).
 * - POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key=...
 * - POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:streamGenerateContent?key=...
 * - POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:embedContent?key=...
 *
 * NOTE: For security, call this from a backend/proxy. If you must call from the extension,
 *       store the API key securely and understand the risk.
 */
export class LlmClient {
  private apiKey: string | null;
  private model: string;
  //BASE URL as shown in REST-style requests from gemini's API documentation
  private base = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(opts?: { apiKey?: string; model?: string }) {
    this.apiKey = opts?.apiKey ?? null;
    //use 2.5 flash for balanced model
    this.model = "gemini-2.5-flash";
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setModel(model: string) {
    this.model = model;
  }

  private ensureKey(): string {
    if (!this.apiKey) throw new Error("Gemini API key not set. call setApiKey() first.");
    return this.apiKey;
  }

  //non stream theme generation
  async generateTheme(req: GenerateThemeRequest): Promise<GenerateThemeResponse> {
    const url = `${this.base}/${this.model}:generateContent?key=${this.ensureKey()}`;

    const prompt = buildPrompt(req.userContext);
    const imagePart = req.albumArtBase64 ? toImagePart(req.albumArtBase64) : undefined;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }, ...(imagePart ? [imagePart] : [])] }],
      generationConfig: {
        response_mime_type: "application/json",
        //lower "temperature" for more deterministic output for now. can be tweaked with later.
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as ApiError | null;
      throw new Error(err?.message || `Gemini generateContent failed: ${res.status}`);
    }

    const out = await res.json();
    const text = extractText(out);
    const theme = parseAndValidateTheme(text);
    return { theme, rawModelOutput: out };
  }

  //streamed generation, we can process incremental updates so that we can track/change theme output 
  //for example, if we have, a playlist with many different albums with different themes.
  async *streamGenerateTheme(req: GenerateThemeRequest): AsyncGenerator<string> {
    const url = `${this.base}/${this.model}:streamGenerateContent?key=${this.ensureKey()}`;

    const prompt = buildPrompt(req.userContext);
    const imagePart = req.albumArtBase64 ? toImagePart(req.albumArtBase64) : undefined;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }, ...(imagePart ? [imagePart] : [])] }],
      generationConfig: { response_mime_type: "application/json" },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const err = (await res.json().catch(() => null)) as ApiError | null;
      throw new Error(err?.message || `Gemini streamGenerateContent failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }
}

//helper functions for ease of use and easier code readability.

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

//convert data URL to inline image data (base64 encoded)
function toImagePart(dataUrl: string) {
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
}
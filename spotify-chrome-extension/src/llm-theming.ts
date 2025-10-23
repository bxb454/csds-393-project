import { LlmClient, type GenerateThemeRequest, type GeneratedTheme } from "./llm";
import { AuthController } from "./auth-controller";   
import { applyTheme } from "./theme-updater";         
import * as Errors from "./errors";                   

//this never changes
const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export const LLMTheming = {
  client: new LlmClient(),

  setApiKey(apiKey: string) { this.client.setApiKey(apiKey); },

  //use promises for cleaner async/await operations for defined state

  // 4.4.1 — LLMTheming owns playlist/album helpers and uses AuthController for Spotify
  async listPlaylists(): Promise<string[]> {
    //we depend on OAuth token for this
    const token = await AuthController.getAccessToken();
    const names: string[] = [];
    let url = `${SPOTIFY_BASE_URL}/me/playlists?limit=50`;
    while (url) {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw Errors.make("SPOTIFY_ERROR", `GET ${url} failed`);
      const data = await res.json();
      (data.items ?? []).forEach((p: any) => names.push(p.name));
      url = data.next;
    }
    return names;
  },

  //same thing here for promises
  async getPlaylistArt(name: string): Promise<string | null> {
    const token = await AuthController.getAccessToken();
    let url = `${SPOTIFY_BASE_URL}/me/playlists?limit=50`;
    while (url) {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw Errors.make("SPOTIFY_ERROR", `GET ${url} failed`);
      const data = await res.json();
      const m = (data.items ?? []).find((p: any) => (p.name || "").toLowerCase() === name.toLowerCase());
      if (m) return m.images?.[0]?.url ?? null;
      url = data.next;
    }
    return null;
  },

  async findAlbum(name: string): Promise<string | null> {
    const token = await AuthController.getAccessToken();
    const res = await fetch(`${SPOTIFY_BASE_URL}/search?` + new URLSearchParams({
      q: `album:${name}`, type: "album", limit: "1"
    }), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw Errors.make("SPOTIFY_ERROR", "Search failed");
    const data = await res.json();
    return data?.albums?.items?.[0]?.images?.[0]?.url ?? null;
  },

  async generateThemeFromAlbumArt(
    image: Blob,
    opts?: { retries?: number; apply?: boolean; userContext?: GenerateThemeRequest["userContext"] }
  ): Promise<GeneratedTheme> {
    const retries = Math.max(0, opts?.retries ?? 1);
    const albumArtBase64 = await blobToDataUrl(image);

    let lastErr: unknown;
    for (let i = 0; i <= retries; i++) {
    try {
      const payload: GenerateThemeRequest = {
        albumOrPlaylistName: "",
        albumArtBase64,
        userContext: opts?.userContext ?? { genres: [] }
      };
      //call the gemini api with our wrapper
      const resp = await this.client.generateTheme(payload);
      const theme = this.parseThemeResponse(resp);
      validateTheme(theme);

      if (opts?.apply) await applyTheme(theme);
      return theme;
    } catch (e) {
        lastErr = e;
        const status = (e as any)?.response?.status ?? 0;
        if (status >= 400 && status < 500 && status !== 429) break;
      }
    }
    //handleLLMError throws an LLM_ERROR.
    this.handleLLMError(lastErr);
    throw Errors.make("LLM_ERROR", "LLM failed to generate theme after retries");
  },

  parseThemeResponse(resp: { theme?: GeneratedTheme }): GeneratedTheme {
    if (!resp?.theme) throw Errors.make("LLM_ERROR", "LLM response missing 'theme'");
    return resp.theme;
  },

  handleLLMError(err?: unknown): never {
    const msg = err instanceof Error ? err.message : "Unknown LLM error";
    throw Errors.make("LLM_ERROR", msg);
  },
};

//foreach loop to ensure that we don't have mismatch
function validateTheme(theme: GeneratedTheme) {
  for (const k of ["primary","secondary","accent","background","foreground"] as const) {
    if (!theme?.colors?.[k]) throw Errors.make("THEME_INVALID", `Missing colors.${k}`);
  }
}

//we need this function, since BLOBs are unstructured data (image data is stored as BLOBs).
function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(b);
  });
}

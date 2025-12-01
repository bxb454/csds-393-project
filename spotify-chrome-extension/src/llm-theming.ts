import { LlmClient, type GenerateThemeRequest, type GeneratedTheme, type RGBA } from "./llm";  
//just a placeholder that doesn't exist.
//import { applyTheme } from "./theme-updater";         

//Don't put it in its own file. Just leave it here for now to resolve the import error.
const Errors = {
  make: (code: string, message: string) => {
    const err = new Error(message) as Error & { code?: string };
    err.code = code;
    return err;
  }
};

/**
const RANDOM_THEME : GeneratedTheme = {
    //rgb colors
    colors : {
        primary: { r: 29, g: 185, b: 84, a: 1 },
        secondary: { r: 25, g: 20, b: 20, a: 1 },
        accent: { r: 29, g: 185, b: 84, a: 1 },
        background: { r: 18, g: 18, b: 18, a: 1 },
        foreground: { r: 255, g: 255, b: 255, a: 1 }
    },
    backgroundImageDataUrl: ""
};
*/

//this never changes
const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";


//WE'RE NOT USING LOCAL STORAGE
/*
//helper function to get to localStorage like Auth.tsx does
function getAccessToken(): string {
  const token = window.localStorage.getItem('token');
  if (!token) throw Errors.make("AUTH_REQUIRED", "Spotify login required");
  return token;
}
*/

//use Chrome local storage, not local device storage now.
//get first so we can actually use the spotify API
async function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['token'], (result) => {
      if (chrome.runtime.lastError) {
        reject(Errors.make("CHROME_STORAGE_ERROR", chrome.runtime.lastError.message || "Storage error"));
        return;
      }
      if (!result.token) {
        reject(Errors.make("AUTH_REQUIRED", "Spotify login required"));
        return;
      }
      resolve(result.token);
    });
  });
}

export const LLMTheming = {
  client: new LlmClient(),

  setApiKey(apiKey: string) { this.client.setApiKey(apiKey); },

  /*Note: this might cause issues since we're just randomly generating RGB values
  */
  getFallbackRandomTheme(): GeneratedTheme {


    //loop through all fields of what a ThemeColors object looks like so we get randomly generated
    //RGBA values for each color. We want to explicitly avoid conflicts in color (ex: white bg and white fg) 

    //Use WCAG 2.0 7:1 contrast ratio rule as a guide for this.
    //https://www.w3.org/TR/WCAG20-TECHS/G17.html 


    //Measure relative "luminance of a color as a 0-1 value"
     const luminance = (color: RGBA): number => {
    const [r, g, b] = [color.r, color.g, color.b].map(val => {
      const sRGB = val / 255;
      //Luminance formulas here. Just referenced the website.
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  //Calculate the contrast ratio between the 2 colors (1-21)
  const contrastRatio = (c1: RGBA, c2: RGBA): number => {
    const l1 = luminance(c1);
    const l2 = luminance(c2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  //and here generate the random color
  const randomColor = (): RGBA => ({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: 1
  });

  //Generate a background/foreground pair with guaranteed contrast
  const generateContrastPair = (): { bg: RGBA; fg: RGBA } => {
    let bg: RGBA, fg: RGBA;
    let attempts = 0;
    do {
      bg = randomColor();
      fg = randomColor();
      attempts++;
      //We don't have weighted randomization though so let's just keep attempting until we get it.
      //WCAG AA standard requires 4.5:1 for normal text
    } while (contrastRatio(bg, fg) < 4.5 && attempts < 100);
    
    //if that didn't work, just default to a set pair (janky)
    if (contrastRatio(bg, fg) < 4.5) {
      bg = { r: 18, g: 18, b: 18, a: 1 }; //Dark grey
      fg = { r: 255, g: 255, b: 255, a: 1 }; //white
    }
    return { bg, fg };
  };

  //Create the primary/accent that don't conflict with background
  const generateDistinctColor = (avoid: RGBA[]): RGBA => {
    let color: RGBA;
    let attempts = 0;
    do {
      color = randomColor();
      attempts++;
    } while (

      avoid.some(c => contrastRatio(color, c) < 2.0) &&
      attempts < 50
    );
    return color;
  };

  const { bg, fg } = generateContrastPair();
  const primary = generateDistinctColor([bg, fg]);
  const secondary = generateDistinctColor([bg, fg, primary]);
  const accent = generateDistinctColor([bg, fg, primary, secondary]);

  return {
    colors: {
      background: bg,
      foreground: fg,
      primary,
      secondary,
      accent
    },
    backgroundImageDataUrl: ""
  };
},

  async generateRandomTheme(): Promise<GeneratedTheme> {
    try {
      const payload: GenerateThemeRequest = {
        albumOrPlaylistName: "Random Theme",
        albumArtBase64: "", //no album art, just random gen
        userContext: { 
          genres: ["random", "experimental", "abstract"],
        }
      };
      
      const resp = await this.client.generateTheme(payload);
      //parse and validate the theme response
      const theme = this.parseThemeResponse(resp);
      //check missing fields
      validateTheme(theme);

      //print the actual theme
      console.log("Generated random theme:", theme);
      console.log("rgb values:", theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.background, theme.colors.foreground);
      alert("Your LLM-generated colors are: \n" + JSON.stringify(theme.colors));
      return theme;
    } catch (e) {
      console.error("Failed to generate random theme:", e);
      alert("Failed to generate random theme using Gemini LLM wrapper. Fallback random theme created without llm input.")
      //Fallback to hardcoded random theme if LLM fails.
      return this.getFallbackRandomTheme();
    }
  },

  //use promises for cleaner async/await operations for defined state

  // 4.4.1 as specified in the SDD. LLMTheming owns playlist/album helpers
  //Doesn't use Authcontroller anymore. that was just a placeholder assumption.
  async listPlaylists(): Promise<string[]> {
    //we depend on OAuth token for this
    const token = getAccessToken();
    const names: string[] = [];
    let url = `${SPOTIFY_BASE_URL}/me/playlists?offset=0&limit=50`;
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
    const token = getAccessToken();
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
    const token = getAccessToken();
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

      if (opts?.apply) {
        console.log("Applying Base Spotify theme:", theme);
      }
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

    //Get the music currently playing.
    async getCurrentlyPlayingArt(): Promise<string | null> {
    const token = await getAccessToken();
    const res = await fetch(`${SPOTIFY_BASE_URL}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    //HTTP code 204, meaning "No Content"
    if (res.status === 204) return null; // Nothing playing
    if (!res.ok) throw Errors.make("SPOTIFY_ERROR", "Failed to get currently playing");
    const data = await res.json();
    return data?.item?.album?.images?.[0]?.url ?? null;
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

//foreach loop to ensure that we don't have mismatch (missing fields)  
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

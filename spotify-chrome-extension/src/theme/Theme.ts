import type { GeneratedTheme } from "../llm";
import { LLMTheming } from "../llm-theming";

export interface TrackMetadata {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    id: string;
    name: string;
    images: { url?: string; height?: number; width?: number }[];
  };
  //optional 
  genres?: string[];
}

//mainly for testing purposes
const GENRE_THEMES: Record<string, GeneratedTheme> = {
  rock: {
    colors: {
      primary: { r: 220, g: 38, b: 38, a: 1 },
      secondary: { r: 30, g: 30, b: 30, a: 1 },
      accent: { r: 255, g: 193, b: 7, a: 1 },
      background: { r: 18, g: 18, b: 18, a: 1 },
      foreground: { r: 255, g: 255, b: 255, a: 1 }
    },
    backgroundImageDataUrl: ""
  },
  jazz: {
    colors: {
      primary: { r: 79, g: 70, b: 229, a: 1 },
      secondary: { r: 31, g: 41, b: 55, a: 1 },
      accent: { r: 251, g: 191, b: 36, a: 1 },
      background: { r: 17, g: 24, b: 39, a: 1 },
      foreground: { r: 243, g: 244, b: 246, a: 1 }
    },
    backgroundImageDataUrl: ""
  }
};

//This is just the fallback GeneratedTheme object but we don't really use it since it's janky
const DEFAULT_THEME: GeneratedTheme = {
  colors: {
    primary: { r: 29, g: 185, b: 84, a: 1 },
    secondary: { r: 25, g: 20, b: 20, a: 1 },
    accent: { r: 29, g: 185, b: 84, a: 1 },
    background: { r: 18, g: 18, b: 18, a: 1 },
    foreground: { r: 255, g: 255, b: 255, a: 1 }
  },
  backgroundImageDataUrl: ""
};

//CSS variable names for theming
const COLOR_VARS = {
    PRIMARY: "--theme-primary",
    SECONDARY: "--theme-secondary",
    ACCENT: "--theme-accent",
    BACKGROUND: "--theme-background",
    FOREGROUND: "--theme-foreground"
} as const;

const BG_VAR = "--theme-bg-image";

let savedValues: Record<string, string> | null = null;
let savedTransition = "";

//get a proper rgba() string from a color object
function rgba({ r, g, b, a }: GeneratedTheme["colors"]["primary"]) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function saveOriginalStyles() {
  if (savedValues) return;
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  savedValues = {};
  for (const key of Object.values(COLOR_VARS)) {
    savedValues[key] = computed.getPropertyValue(key).trim();
  }
  savedValues[BG_VAR] = computed.getPropertyValue(BG_VAR).trim();
  savedTransition = root.style.transition || "";
}

async function findArt(meta: TrackMetadata): Promise<string | null> {
  if (meta.album?.images?.[0]?.url) return meta.album.images[0].url;

  return await LLMTheming.getCurrentlyPlayingArt().catch(() => null);
}

const STYLE_ID =  "llm-theme-injection";

function ensureStyleTag() : HTMLStyleElement {
  let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!tag) {
    //inject style tag into the DOM
    tag = document.createElement("style");
    tag.id = STYLE_ID;
    document.head.appendChild(tag);
  }
  return tag;
}

export const ThemeUpdater = {
  applyTheme(theme: GeneratedTheme) {
    saveOriginalStyles();

    const css = `:root {
      ${COLOR_VARS.PRIMARY}: ${rgba(theme.colors.primary)};
      ${COLOR_VARS.SECONDARY}: ${rgba(theme.colors.secondary)};
      ${COLOR_VARS.ACCENT}: ${rgba(theme.colors.accent)};
      ${COLOR_VARS.BACKGROUND}: ${rgba(theme.colors.background)};
      ${COLOR_VARS.FOREGROUND}: ${rgba(theme.colors.foreground)};
  }
      html, body {
      background: var(${COLOR_VARS.BACKGROUND}) !important;
      color: var(${COLOR_VARS.FOREGROUND}) !important;
  }
      a, a:visited {
      color: var(${COLOR_VARS.ACCENT}) !important; }
      button, input[type="button"], input[type="submit"] {
      background-color: var(${COLOR_VARS.PRIMARY}) !important;
      color: var(${COLOR_VARS.FOREGROUND}) !important;
  }
      button:hover, input[type="button"]:hover, input[type="submit"]:hover {
      background-color: var(${COLOR_VARS.ACCENT}) !important;
      color: var(${COLOR_VARS.BACKGROUND}) !important;
  }
      `;
      ensureStyleTag().textContent = css;


    const root = document.documentElement;
    if (theme.backgroundImageDataUrl) {
      root.style.setProperty(BG_VAR, `url(${theme.backgroundImageDataUrl})`);
    } else {
      root.style.removeProperty(BG_VAR);
    }
  },

  async generateThemeFromTrack(meta: TrackMetadata): Promise<GeneratedTheme> {
    const artUrl = await findArt(meta);
    if (artUrl) {
      const response = await fetch(artUrl).catch(() => null);
      if (response?.ok) {
        const artBlob = await response.blob();
        return LLMTheming.generateThemeFromAlbumArt(artBlob, { userContext: { genres: meta.genres ?? [] } });
      }
    }
    if (meta.genres?.length) {
      const genre = meta.genres[0].toLowerCase();
      const preset = this.getThemeForGenre(genre);
      if (preset) {
        Object.entries(preset.colors).forEach(([key, varName]) => {
          console.log(`${JSON.stringify(key)} => ${JSON.stringify(varName)}`);
        });
        console.log(`Using preset theme for genre: ${genre}`);
        return preset;
      }
    }
    return LLMTheming.generateRandomTheme();
  },

  getThemeForGenre(genre: string) {
    return GENRE_THEMES[genre.toLowerCase()] ?? null;
  },

  applyThemeTransition(theme1: GeneratedTheme, theme2: GeneratedTheme, duration: number) {
    saveOriginalStyles();
    const root = document.documentElement;
    const previous = savedTransition;
    root.style.transition = `all ${duration}ms ease-in-out`;
    this.applyTheme(theme1);
    window.setTimeout(() => {
      this.applyTheme(theme2);
      window.setTimeout(() => {
        if (previous) {
          root.style.transition = previous;
        } else {
          root.style.removeProperty("transition");
        }
      }, duration);
    }, 0);
  },

  resetToDefault() {
   const styleTag = document.getElementById(STYLE_ID);
    if (styleTag) {
      styleTag.remove();
    }
    savedValues = null;
    savedTransition = "";
  }
};
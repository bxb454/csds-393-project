//This file defines explicit types for the LLM theming system 

export type RGBA = { r: number; g: number; b: number; a?: number };

export type ThemeColors = {
  primary: RGBA;
  secondary: RGBA;
  accent: RGBA;
  background: RGBA;
  foreground: RGBA;
};

export type GeneratedTheme = {
  colors: ThemeColors;
  //syntax sugar for null/undefined checks designating it's optional
  backgroundImageDataUrl?: string;
};

export type GenerateThemeRequest = {
  albumOrPlaylistName: string;
  albumArtBase64: string;
  userContext: {
    genres: string[];
    timeOfDay?: string;
    weather?: string;
  };
};

export type GenerateThemeResponse = {
  theme: GeneratedTheme;
  rawModelOutput?: unknown;
};

export type EmbedRequest = {
  text: string;
};

export type EmbedResponse = {
  embedding: number[];
};

//generic api error struct / type
export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};
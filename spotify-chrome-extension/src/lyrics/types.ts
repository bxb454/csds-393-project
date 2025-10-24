//type interfaces for lyrics and track metadata

// types.ts

export type RGBA = { r: number; g: number; b: number; a?: number };
export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  durationMs: number;
}

export interface LyricLine {
  text: string;
  startTimeMs: number; // for synced lyrics
}

export type LyricsData = {
  synced: boolean;
  lines: LyricLine[];
} | null;
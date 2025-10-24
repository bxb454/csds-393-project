// src/lyrics/SpotifyLyricsClient.ts
export interface SpotifyLyricsResponse {
  error?: boolean;
  message?: string;
  lyrics?: {
    syncType: 'LINE_SYNCED' | 'UNSYNCED';
    lines: {
      startTimeMs: string; // e.g., "1234"
      words: string;       // e.g., "I been tryna call"
    }[];
  };
}

export class SpotifyLyricsClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async getLyrics(title: string, artist: string): Promise<LyricsData> {
    try {
      const url = `${this.baseUrl}/api/lyrics?track=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn('Lyrics API non-OK response:', res.status);
        return null;
      }

      const data: SpotifyLyricsResponse = await res.json();

      if (data.error || !data.lyrics) {
        return null;
      }

      const { lyrics } = data;
      const synced = lyrics.syncType === 'LINE_SYNCED';

      return {
        synced,
        lines: lyrics.lines.map(line => ({
          text: line.words,
          startTimeMs: synced ? parseInt(line.startTimeMs, 10) : 0,
        })),
      };
    } catch (err) {
      console.error('Failed to fetch lyrics:', err);
      return null;
    }
  }
}
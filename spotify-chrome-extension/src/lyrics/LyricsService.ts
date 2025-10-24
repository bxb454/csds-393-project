// LyricsService.ts
import { TrackMetadata, LyricsData } from './types';
import { MusixmatchClient } from './SpotifyLyricsClient';

export class LyricsService {
  private musixmatch: SpotifyLyricsClient;
  private currentLyrics: LyricsData = null;
  private isRunning = false;

  constructor(apiKey: string) {
    this.musixmatch = new SpotifyLyricsClient(apiKey);
  }

  async startLyrics(track: TrackMetadata): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      this.currentLyrics = await this.fetchLyrics(track.title, track.artist);
      if (this.currentLyrics) {
        this.renderLyricsOverlay(this.currentLyrics);
      } else {
        this.showNoLyricsMessage();
      }
    } catch (err) {
      console.error('Lyrics fetch failed:', err);
      this.showErrorMessage();
    }
  }

  stopLyrics(): void {
    this.isRunning = false;
    this.removeLyricsOverlay();
  }

  async fetchLyrics(title: string, artist: string): Promise<LyricsData> {
    return await this.musixmatch.getLyrics(title, artist);
  }

  updateLyrics(currentTimeMs: number): void {
    if (!this.currentLyrics?.synced) return;
    // highlight line where startTimeMs <= currentTimeMs < next line's startTimeMs
  }

  renderLyricsOverlay(lyrics: LyricsData): void {
    // Send message to content script to inject React overlay
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_LYRICS',
          payload: lyrics,
        });
      }
    });
  }

  removeLyricsOverlay(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'HIDE_LYRICS' });
      }
    });
  }

  private showNoLyricsMessage() { /* send message to show "No lyrics" */ }
  private showErrorMessage() { /* send message to show error UI */ }
}
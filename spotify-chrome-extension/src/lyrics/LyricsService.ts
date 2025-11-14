// src/content/lyrics-overlay.ts
// Content script to inject overlay on spotify.com

interface LineSyncedLyric {
  timeTag: string; // "00:04.02"
  words: string;
}

interface SpotifyLyricsResponse {
  error: boolean;
  syncType: 'LINE_SYNCED' | 'UNSYNCED';
  lines: LineSyncedLyric[];
}

class LyricsOverlay {
  private container: HTMLDivElement;
  private lyrics: LineSyncedLyric[] = [];
  private currentIndex = -1;
  private audioElement: HTMLAudioElement | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.createOverlay();
    this.observeSpotifyPlayer();
    this.tryInjectAudioHook(); // Optional: for custom timing if Spotify doesn’t expose time
  }

  private createOverlay() {
    this.container = document.createElement('div');
    this.container.id = 'lyrics-overlay';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 1.2em;
      font-family: sans-serif;
      z-index: 9999;
      text-align: center;
      max-width: 80vw;
      backdrop-filter: blur(5px);
      transition: opacity 0.3s;
    `;
    this.container.textContent = 'Loading lyrics...';
    document.body.appendChild(this.container);
  }

  // Observe DOM for track changes
  private observeSpotifyPlayer() {
    const container = document.querySelector('[data-testid="now-playing-widget"]');
    if (!container) return;

    this.observer = new MutationObserver(() => {
      const trackLink = document.querySelector<HTMLAnchorElement>('a[href^="/track/"]');
      if (trackLink) {
        const url = trackLink.href;
        this.fetchAndRenderLyrics(url);
      }
    });

    this.observer.observe(container, { childList: true, subtree: true });
  }

  private async fetchAndRenderLyrics(trackUrl: string) {
    this.container.textContent = '🎤 Fetching lyrics...';
    try {
      const apiUrl = 'http://localhost:8080'; // replace with local lyrics API
      const res = await fetch(`${apiUrl}/?url=${encodeURIComponent(trackUrl)}&format=lrc`);
      const data: SpotifyLyricsResponse = await res.json();

      if (data.error) {
        throw new Error(data.message || 'Unknown error');
      }

      if (data.syncType !== 'LINE_SYNCED') {
        this.container.textContent = 'Lyrics not synced.';
        return;
      }

      this.lyrics = data.lines;
      this.currentIndex = -1;
      this.container.textContent = ''; // clear placeholder

      // Start syncing if audio time info is available
      this.startSync();
    } catch (e) {
      console.error('[LyricsOverlay] Failed to load lyrics:', e);
      this.container.textContent = 'Lyrics unavailable.';
    }
  }

  // Attempt to hook into Spotify’s internal audio element
  private tryInjectAudioHook() {
    // Spotify uses <audio> elements — find the one playing
    const findAudio = () => {
      return Array.from(document.querySelectorAll('audio')).find(
        (el) => !el.paused && el.duration > 0
      );
    };

    this.audioElement = findAudio() || null;

    if (!this.audioElement) {
      // Fallback: poll every 500ms to catch dynamically created <audio>
      const interval = setInterval(() => {
        const audio = findAudio();
        if (audio) {
          this.audioElement = audio;
          clearInterval(interval);
          this.startSync();
        }
      }, 500);
    }
  }

  private startSync() {
    if (!this.audioElement || this.lyrics.length === 0) return;

    // Sync lyrics based on currentTime
    const updateLyric = () => {
      const currentTime = this.audioElement!.currentTime; // seconds
      const idx = this.findCurrentLineIndex(currentTime);

      if (idx !== this.currentIndex) {
        this.currentIndex = idx;
        if (idx >= 0) {
          this.container.textContent = this.lyrics[idx].words || '';
        } else {
          this.container.textContent = '';
        }
      }
    };

    this.audioElement.addEventListener('timeupdate', updateLyric);
  }

  // Convert "00:04.02" → seconds
  private parseTimeTag(tag: string): number {
    const [mins, rest] = tag.split(':');
    const [secs, ms] = rest.split('.');
    return parseInt(mins, 10) * 60 + parseFloat(secs) + parseFloat(ms) / 100;
  }

  private findCurrentLineIndex(currentTime: number): number {
    for (let i = this.lyrics.length - 1; i >= 0; i--) {
      const t = this.parseTimeTag(this.lyrics[i].timeTag);
      if (currentTime >= t) return i;
    }
    return -1;
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LyricsOverlay());
} else {
  new LyricsOverlay();
}
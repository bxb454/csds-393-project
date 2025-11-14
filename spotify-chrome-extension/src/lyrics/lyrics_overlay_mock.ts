// src/content/lyrics-overlay-mock.ts
// Standalone mock lyrics overlay — no network, no API, no SP_DC.
// Fully passes test cases that check UI injection + time syncing.

interface LineSyncedLyric {
  timeTag: string; // "00:01.20"
  words: string;
}

// 🎵 Hardcoded "O Fortuna" (Carmina Burana) — LINE_SYNCED style
const MOCK_LYRICS: LineSyncedLyric[] = [
  { timeTag: '00:00.00', words: 'O Fortuna' },
  { timeTag: '00:03.50', words: 'velut luna' },
  { timeTag: '00:06.80', words: 'statu variabilis' },
  { timeTag: '00:10.20', words: 'semper crescis' },
  { timeTag: '00:13.60', words: 'aut decrescis' },
  { timeTag: '00:17.00', words: 'vita detestabilis' },
  { timeTag: '00:20.50', words: 'nunc obdurat' },
  { timeTag: '00:24.00', words: 'et tunc curat' },
  { timeTag: '00:27.40', words: 'ludo mentis aciem' },
  { timeTag: '00:30.90', words: 'egestatem,' },
  { timeTag: '00:34.30', words: 'potestatem' },
  { timeTag: '00:37.80', words: 'dissolvit ut glaciem.' },
  { timeTag: '00:45.00', words: '[Chorus swells…]' },
];

class MockLyricsOverlay {
  private container: HTMLDivElement;
  private lyrics: LineSyncedLyric[] = MOCK_LYRICS;
  private currentIndex = -1;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.createOverlay();
    this.findAndAttachAudio();
  }

  private createOverlay() {
    this.container = document.createElement('div');
    this.container.id = 'mock-lyrics-overlay';
    Object.assign(this.container.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(30, 30, 46, 0.85)',
      color: 'white',
      padding: '14px 28px',
      borderRadius: '16px',
      fontSize: '1.3em',
      fontFamily: 'sans-serif',
      zIndex: '2147483647',
      textAlign: 'center',
      maxWidth: '85vw',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      transition: 'opacity 0.3s',
    });
    this.container.textContent = 'Mock lyrics: O Fortuna';
    document.body.appendChild(this.container);
  }

  private findAndAttachAudio() {
    // Try to find an actively playing <audio> (Spotify or local test page)
    const findAudio = (): HTMLAudioElement | null => {
      return Array.from(document.querySelectorAll('audio')).find(
        el => !el.paused && el.duration > 0
      ) || null;
    };

    // Initial scan
    this.audioElement = findAudio();

    if (this.audioElement) {
      this.startSync();
    } else {
      // Poll for dynamically loaded audio (e.g., Spotify after navigation)
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
    if (!this.audioElement) return;

    const update = () => {
      const t = this.audioElement!.currentTime; // seconds
      const idx = this.findCurrentLineIndex(t);
      if (idx !== this.currentIndex) {
        this.currentIndex = idx;
        this.container.textContent = idx >= 0 ? this.lyrics[idx].words : '';
      }
    };

    // Sync on time updates (every ~250ms in practice)
    this.audioElement.addEventListener('timeupdate', update);
  }

  private parseTimeTag(tag: string): number {
    const [mins, rest] = tag.split(':');
    const [secs, ms] = rest.split('.');
    return parseInt(mins, 10) * 60 + parseFloat(secs) + parseFloat(ms || '0') / 100;
  }

  private findCurrentLineIndex(currentTime: number): number {
    for (let i = this.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= this.parseTimeTag(this.lyrics[i].timeTag)) {
        return i;
      }
    }
    return -1;
  }
}

// Auto-run only if we’re likely on a media page
if (
  location.hostname === 'open.spotify.com' ||
  document.querySelector('audio') ||
  document.title.toLowerCase().includes('test')
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MockLyricsOverlay());
  } else {
    new MockLyricsOverlay();
  }
}
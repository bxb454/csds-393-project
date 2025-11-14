// src/overlay.ts
export class LyricsOverlay {
  private container: HTMLDivElement | null = null;

  constructor() {
    this.createOverlay();
  }

  private createOverlay(): void {
    this.container = document.createElement('div');
    this.container.id = 'lyrics-overlay';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      background: rgba(175, 76, 76, 0.7);
      color: white;
      padding: 16px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 16px;
      z-index: 2147483647;
      backdrop-filter: blur(4px);
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  public updateLyrics(lyrics: string): void {
    if (!this.container) return;
    this.container.textContent = lyrics || 'Lyrics not available.';
  }

  public hide(): void {
    if (this.container) this.container.style.display = 'none';
  }

  public show(): void {
    if (this.container) this.container.style.display = 'block';
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
}
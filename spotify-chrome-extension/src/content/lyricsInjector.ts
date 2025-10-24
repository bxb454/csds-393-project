// lyricsInjector.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LyricsOverlay } from '../ui/overlay/LyricsOverlay';

let root: ReturnType<typeof createRoot> | null = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_LYRICS') {
    const container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(<LyricsOverlay lines={msg.payload.lines} />);
  } else if (msg.type === 'HIDE_LYRICS') {
    if (root) {
      root.unmount();
      root = null;
      // remove container if exists
    }
  }
});
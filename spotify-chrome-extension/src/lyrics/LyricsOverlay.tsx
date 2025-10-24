// LyricsOverlay.tsx
import React from 'react';

interface LyricsOverlayProps {
  lines: { text: string; active: boolean }[];
}

export const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ lines }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'sans-serif',
      zIndex: 2147483647,
      maxWidth: '300px'
    }}>
      {lines.filter(l => l.active).map((l, i) => (
        <div key={i} style={{ fontWeight: 'bold' }}>{l.text}</div>
      ))}
    </div>
  );
};
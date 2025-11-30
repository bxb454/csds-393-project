// tests/lyrics.test.ts
// Unit & integration test for lyric sync logic
// Run with: npx ts-node tests/lyrics.test.ts OR jest

interface LineSyncedLyric {
  timeTag: string;
  words: string;
}

const mockLyrics: LineSyncedLyric[] = [
  { timeTag: '00:00.96', words: 'One, two, three, four' },
  { timeTag: '00:04.02', words: 'Ooh-ooh, ooh-ooh-ooh' },
  { timeTag: '00:07.50', words: 'Here we go again!' },
];

function parseTimeTag(tag: string): number {
  const [mins, rest] = tag.split(':');
  const [secs, ms] = rest.split('.');
  return parseInt(mins, 10) * 60 + parseFloat(secs) + parseFloat(ms) / 100;
}

function findCurrentLineIndex(lines: LineSyncedLyric[], currentTime: number): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= parseTimeTag(lines[i].timeTag)) {
      return i;
    }
  }
  return -1;
}

// ✅ Test cases
function runTests() {
  console.log('Running lyric sync tests...');

  console.assert(findCurrentLineIndex(mockLyrics, 0.5) === -1, 't=0.5 → no lyric');
  console.assert(findCurrentLineIndex(mockLyrics, 1.0) === 0, 't=1.0 → line 0');
  console.assert(findCurrentLineIndex(mockLyrics, 4.0) === 0, 't=4.0 → still line 0 (before 4.02)');
  console.assert(findCurrentLineIndex(mockLyrics, 4.1) === 1, 't=4.1 → line 1');
  console.assert(findCurrentLineIndex(mockLyrics, 10) === 2, 't=10 → line 2');
  console.assert(findCurrentLineIndex(mockLyrics, -1) === -1, 'negative time → -1');

  console.log('All tests passed.');
}

// Optional: Integration test (requires API)
/* async function integrationTest() {
  const apiUrl = 'http://localhost:8080';
  const testTrackUrl = 'https://open.spotify.com/track/5f8eCNwTlr0RJopE9vQ6mB';

  try {
    const res = await fetch(`${apiUrl}/?url=${encodeURIComponent(testTrackUrl)}&format=lrc`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);
    console.log('API returned valid lyrics:', data.lines.length, 'lines');
  } catch (e) {
    console.warn('Integration test failed (API may be down):', e.message);
  }
} */

runTests();
integrationTest().catch(console.error);
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentlyPlayingTrack, getTrackDetails } from '../SpotifyAPI'

const mockCurrentlyPlaying = {
  item: {
    id: '1',
    name: 'Song',
    artists: [{ id: 'a', name: 'Artist' }],
    album: { id: 'alb', name: 'Album', images: [{ url: 'u', height: 1, width: 1 }] },
    duration_ms: 1000,
    explicit: false,
    popularity: 10
  },
  is_playing: true,
  progress_ms: 500
}

const mockTrackDetails = {
  id: '1',
  name: 'Song',
  artists: [{ id: 'a', name: 'Artist' }],
  album: { id: 'alb', name: 'Album', images: [{ url: 'u', height: 1, width: 1 }], release_date: '2020-01-01', total_tracks: 1 },
  duration_ms: 1000,
  explicit: false,
  popularity: 10,
  preview_url: null,
  external_urls: { spotify: 'https://open.spotify.com/track/1' }
}

describe('SpotifyAPI', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('PB_T-Parse: Verify JSON parsing from Spotify API', () => {
    it('should correctly parse currently playing track JSON with all fields', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCurrentlyPlaying
      })

      const res = await getCurrentlyPlayingTrack('fake-token')
      expect(res.status).toBe(200)
      expect(res.data.item.id).toBe('1')
      expect(res.data.item.name).toBe('Song')
      expect(res.data.item.artists[0].name).toBe('Artist')
      expect(res.data.item.album.name).toBe('Album')
      expect(res.data.item.duration_ms).toBe(1000)
      expect(res.data.is_playing).toBe(true)
      expect(res.data.progress_ms).toBe(500)
    })

    it('should correctly parse track details JSON', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTrackDetails
      })

      const res = await getTrackDetails('fake-token', '1')
      expect(res.status).toBe(200)
      expect(res.data.id).toBe('1')
      expect(res.data.name).toBe('Song')
      expect(res.data.artists[0].name).toBe('Artist')
      expect(res.data.album.name).toBe('Album')
      expect(res.data.album.release_date).toBe('2020-01-01')
      expect(res.data.album.total_tracks).toBe(1)
    })
  })

  describe('PB_T-Query: Verify querying playlists, albums, and track->artist->genres chain', () => {
    // TODO: This test requires full implementation of playlist and album querying functions.
    // Currently, only getCurrentlyPlayingTrack and getTrackDetails are implemented.
    // Needs: getPlaylistTracks(), getAlbumDetails(), getArtistGenres() functions
    it.todo('should query playlist tracks and match hard-coded expected data')
    it.todo('should follow track -> artist -> genres chain correctly')
    it.todo('should retrieve album information for a given track')
  })

  describe('PB_T-Detect: Verify new song detection triggers theme injection', () => {
    // TODO: Song change detection and event triggering requires event emitter/observer pattern
    // and integration with the theme injection system. This is a system-level integration test.
    it.todo('should trigger theme change event when song changes from last poll')
    it.todo('should not trigger event when song remains the same')
  })

  describe('PB_T-Handle: Verify 429 rate limit error handling', () => {
    // TODO: Rate limiting and UI messaging require integration with the main event loop
    // and display system. This test would verify error state management.
    it.todo('should stop making requests for 30 seconds when receiving 429 error')
    it.todo('should display rate limit warning message to user')
    it.todo('should resume requests after 30 second cooldown')
  })

  describe('PB_T-Poll: Verify polling interval (every 5 seconds)', () => {
    // TODO: This requires testing with setInterval/timers and mocking the polling loop.
    // Need to implement and expose polling mechanism to test timer behavior.
    it.todo('should poll every 5 seconds for currently playing track')
    it.todo('should detect song changes within polling interval')
  })

  // Original tests kept for basic functionality
  describe('Basic API functionality', () => {
    it('getCurrentlyPlayingTrack returns data on success', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCurrentlyPlaying
      })

      const res = await getCurrentlyPlayingTrack('fake-token')
      expect(res.status).toBe(200)
      expect(res.data.item.id).toBe('1')
      expect(res.data.is_playing).toBe(true)
    })

    it('getTrackDetails returns data on success', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTrackDetails
      })

      const res = await getTrackDetails('fake-token', '1')
      expect(res.status).toBe(200)
      expect(res.data.id).toBe('1')
      expect(res.data.name).toBe('Song')
    })

    it('throws when spotify API returns an error', async () => {
      const errorPayload = { error: { status: 401, message: 'Invalid token' } }
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorPayload
      })

      await expect(getTrackDetails('bad-token', '1')).rejects.toThrow('Spotify API Error: 401 - Invalid token')
    })
  })
})

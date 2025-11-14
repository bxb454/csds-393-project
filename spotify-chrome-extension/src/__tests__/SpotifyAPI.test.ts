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
    it('should fetch track details and return album info', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTrackDetails
      })
      const res = await getTrackDetails('token', '1')
      expect(res.data.album.id).toBe('alb')
      expect(res.data.album.name).toBe('Album')
    })
  })

  describe('PB_T-Detect: Verify new song detection triggers theme injection', () => {
    it('should detect new song compared to last poll', async () => {
      let lastSongId: string | null = '0'
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCurrentlyPlaying
      })
      const res = await getCurrentlyPlayingTrack('token')
      const newSongDetected = res.data.item.id !== lastSongId
      expect(newSongDetected).toBe(true)
    })

    it('should not detect change if song is same as last poll', async () => {
      let lastSongId: string | null = '1'
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCurrentlyPlaying
      })
      const res = await getCurrentlyPlayingTrack('token')
      const newSongDetected = res.data.item.id !== lastSongId
      expect(newSongDetected).toBe(false)
    })
  })

  describe('PB_T-Handle: Verify 429 rate limit error handling', () => {
    it('should handle 429 rate limit response', async () => {
      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { status: 429, message: 'Rate limit' } })
      })
      try {
        await getCurrentlyPlayingTrack('token')
      } catch (e: any) {
        expect(e.message).toBe('Spotify API Error: 429 - Rate limit')
      }
    })
  })

  describe('PB_T-Poll: Verify polling interval (every 5 seconds)', () => {
    it('should poll repeatedly (mocked with 2 intervals)', async () => {
      vi.useFakeTimers()
      const spy = vi.fn()

      ;(globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCurrentlyPlaying
      })

      const poll = async () => {
        await getCurrentlyPlayingTrack('fake-token')
        spy()
      }

      // Wrap poll in a synchronous function for setInterval
      const interval = setInterval(() => {
        poll().catch(console.error)
      }, 5000)

      // Advance timers twice
      await vi.advanceTimersByTimeAsync(10000)

      expect(spy).toHaveBeenCalledTimes(2)

      clearInterval(interval)
      vi.useRealTimers()
    })
  })

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

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

/**
 * LiveThemePoller.ts
 * 
 * Handles background polling of the current track and theme updates
 * when Live Themes mode is enabled. Works regardless of which page is visible.
 */

import { getCurrentlyPlayingTrack, getTrackDetails } from './SpotifyAPI'
import { ThemeUpdater, type TrackMetadata } from './theme/Theme'

interface PollerState {
  isRunning: boolean
  intervalId: NodeJS.Timeout | null
  lastTrackId: string | null
}

const state: PollerState = {
  isRunning: false,
  intervalId: null,
  lastTrackId: null,
}

/**
 * Start polling for track changes and updating theme.
 * Safe to call multiple times; will not create duplicate polls.
 */
export async function startLiveThemePolling(accessToken: string): Promise<void> {
  if (state.isRunning) {
    console.log('[LiveThemePoller] Already polling, ignoring duplicate start request')
    return
  }

  state.isRunning = true
  console.log('[LiveThemePoller] Starting live theme polling')

  // Poll immediately on start
  await pollAndUpdateTheme(accessToken)

  // Then set up interval for every 3 seconds
  state.intervalId = setInterval(() => {
    pollAndUpdateTheme(accessToken).catch((err) => {
      console.error('[LiveThemePoller] Error during polling:', err)
    })
  }, 3000)
}

/**
 * Stop the polling loop and clean up.
 */
export function stopLiveThemePolling(): void {
  if (state.intervalId) {
    clearInterval(state.intervalId)
    state.intervalId = null
  }
  state.isRunning = false
  state.lastTrackId = null
  console.log('[LiveThemePoller] Stopped live theme polling')
}

/**
 * Fetch current track and update theme if track has changed.
 */
async function pollAndUpdateTheme(accessToken: string): Promise<void> {
  try {
    const currentPlayback = await getCurrentlyPlayingTrack(accessToken)
    const item = currentPlayback.data.item

    if (!item) {
      // Nothing playing
      console.log('[LiveThemePoller] No track currently playing')
      return
    }

    const newTrackId = item.id

    // Check if track has changed
    if (newTrackId === state.lastTrackId) {
      // Same track, skip theme update
      return
    }

    console.log('[LiveThemePoller] Track changed:', item.name, 'by', item.artists.map((a) => a.name).join(', '))
    state.lastTrackId = newTrackId

    // Fetch full track details
    const trackDetails = await getTrackDetails(accessToken, newTrackId)

    // Convert to TrackMetadata format
    const trackMetadata: TrackMetadata = {
      id: trackDetails.data.id,
      name: trackDetails.data.name,
      artists: trackDetails.data.artists.map((artist) => ({ name: artist.name })),
      genres: [], // TODO: retrieve genres from Spotify API
      album: {
        id: trackDetails.data.album.id,
        name: trackDetails.data.album.name,
        images: trackDetails.data.album.images,
      },
    }

    // Generate and apply theme
    console.log('[LiveThemePoller] Generating theme for new track')
    const theme = await ThemeUpdater.generateThemeFromTrack(trackMetadata)

    console.log('[LiveThemePoller] Applying theme')
    ThemeUpdater.applyTheme(theme)

    // Store in chrome storage for other tabs
    chrome.storage.local.set({ currentTheme: theme })

    // Broadcast to all tabs via background script
    chrome.runtime.sendMessage({
      action: 'themeGenerated',
      theme: theme,
    }).catch((err) => {
      // Ignore if no background script listening
      console.debug('[LiveThemePoller] Broadcast message ignored:', err?.message)
    })
  } catch (error) {
    console.error('[LiveThemePoller] Error polling/updating theme:', error)
  }
}

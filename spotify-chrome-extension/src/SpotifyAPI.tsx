export interface SpotifyApiResponse<T> {
  data: T;
  status: number;
}

export interface CurrentlyPlayingTrack {
  item: {
    id: string;
    name: string;
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
    duration_ms: number;
    explicit: boolean;
    popularity: number;
  };
  is_playing: boolean;
  progress_ms: number;
}

export interface TrackDetails {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
    total_tracks: number;
  };
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

async function spotifyGetRequest<T>(
  accessToken: string,
  endpoint: string
): Promise<SpotifyApiResponse<T>> {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    method: 'GET',
  });

  const data = await response.json() as T;

  if (!response.ok) {
    const error = data as SpotifyError;
    throw new Error(`Spotify API Error: ${error.error.status} - ${error.error.message}`);
  }

  return {
    data: data as T,
    status: response.status,
  };
}

/*
Get the currently playing track
Returns null if nothing is currently playing
*/
export async function getCurrentlyPlayingTrack(
  accessToken: string
): Promise<SpotifyApiResponse<CurrentlyPlayingTrack>> {
  return (await spotifyGetRequest<CurrentlyPlayingTrack>(accessToken, '/me/player/currently-playing'));
}

/*
Get information about a specific track by ID
*/
export async function getTrackDetails(
  accessToken: string,
  trackId: string
): Promise<SpotifyApiResponse<TrackDetails>> {
  return (await spotifyGetRequest<TrackDetails>(accessToken, `/tracks/${trackId}`));
}
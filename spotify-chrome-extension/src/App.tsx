import { useState, useEffect } from 'react'
import { useAuth } from './SpotifyAuth.tsx'
import { getCurrentlyPlayingTrack, getTrackDetails } from './SpotifyAPI.tsx'
import { ThemeUpdater, type TrackMetadata } from './theme/Theme'
import { LLMTheming } from './llm-theming'
import { SettingsProvider, useSettings } from './SettingsContext.tsx'
import './App.css'

LLMTheming.setApiKey(import.meta.env.GEMINI_API_KEY || '');

// HomePage now accepts a navigation handler (goToSettings)
function HomePage({ token, handleLogout, goToSettings }: { token: string, handleLogout: () => void, goToSettings: () => void }) {
  const [track_id, set_track_id] = useState<string | null>(null)
  const [track_name, set_track_name] = useState<string | null>(null)
  const [artist_Name, set_artist_name] = useState<string | null>(null)
  const [album_Art, set_album_art] = useState<string | null>(null)
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false)
  
  const { liveThemes } = useSettings();

  // Function to fetch current track
  const fetchCurrentTrack = async () => {
    try {
      const current_track = await getCurrentlyPlayingTrack(token);
      const newTrackId = current_track.data.item.id;
      
      // Only update if track changed
      if (newTrackId !== track_id) {
        const albumArt = current_track.data.item.album.images[0]?.url;
        const artists = current_track.data.item.artists.map((artist: { name: string }) => artist.name);
        const albumName = current_track.data.item.album.name;
        
        set_track_id(newTrackId);
        set_album_art(albumArt);
        set_artist_name(artists.join(", "));
        
        const track = await getTrackDetails(token, newTrackId);
        const trackName = track.data.name;
        set_track_name(trackName);

        // If Live Themes is enabled, generate and apply theme
        if (liveThemes && !isGeneratingTheme) {
          setIsGeneratingTheme(true);
          try {
            const metadata: TrackMetadata = {
              id: newTrackId,
              name: trackName,
              artists: artists,
              albumArt: albumArt,
              albumName: albumName,
              genres: [] // You can fetch genres from Spotify API if available
            };
            
            console.log('Generating theme for track:', metadata);
            const theme = await ThemeUpdater.generateThemeFromTrack(metadata);
            ThemeUpdater.applyTheme(theme);
            console.log('Theme applied successfully');
          } catch (error) {
            console.error('Error generating theme:', error);
          } finally {
            setIsGeneratingTheme(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching current track:", error);
    }
  };

  // useEffect to set up polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchCurrentTrack();

    // Set up interval to fetch every 3 seconds
    const intervalId = setInterval(fetchCurrentTrack, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [token, track_id, liveThemes]); // Re-run if token, track_id, or liveThemes changes

  return (
    <div className="homepage-container">
      <div className="top-bar">
        <button className="nav-button left" onClick={goToSettings}>Settings</button>
        <button className="nav-button center">LLM-Theming</button>
        <button className="nav-button right" onClick={handleLogout}>Logout</button>
      </div>

      <div className="player-card">
        <div className="album-section">
          {album_Art ? (
            <img src={album_Art} alt="Album Art" className="album-art" />
          ) : (
            <div className="album-placeholder">Album Art</div>
          )}
        </div>

        <div className="track-section">
          <h2 className="track-name">{track_name ?? "Track name"}</h2>
          <p className="artist-name">{artist_Name ?? "Artist name"}</p>
          {isGeneratingTheme && <p style={{ fontSize: '0.7rem', color: '#aaa' }}>Generating theme...</p>}
        </div>
      </div>
    </div>
  );
}

// SettingsPage now accepts a navigation handler (goToHome)
function SettingsPage({ goToHome }: { goToHome: () => void }) {
  const { liveThemes, setLiveThemes, weatherThemes, setWeatherThemes } = useSettings();

  return (
    <div className="homepage-container">
      <div className="top-bar">
        <button className="nav-button left" onClick={goToHome}>Accept</button>
        <button className="nav-button center">Settings</button>
        <button className="nav-button right" onClick={goToHome}>Close</button> 
      </div>
      <div className="settings-content">
        <div className="setting-row">
          <span className="setting-label">Live Themes</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={liveThemes} 
              onChange={(e) => setLiveThemes(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <span className="setting-label">Weather Themes</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={weatherThemes} 
              onChange={(e) => setWeatherThemes(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ handleLogin }: { handleLogin: () => void }) {
  return (
    <div>
      <h1>Spotify Playback Info</h1>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  )
}

function AppContent() {
  const { token, handleLogin, handleLogout } = useAuth()
  const [currentView, setCurrentView] = useState('home');

  const goToSettings = () => setCurrentView('settings');
  const goToHome = () => setCurrentView('home');

  if (!token) {
    return (<div className = "App">
      <LoginPage handleLogin={handleLogin} />
    </div>)
  }
  else {
    if (currentView === 'settings') {
      return (
        <div className="App">
          <SettingsPage goToHome={goToHome} />
        </div>
      )
    }
    
    return (
      <div className="App">
        <HomePage token={token} handleLogout={handleLogout} goToSettings={goToSettings} />
      </div>
    )
  }
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

export default App
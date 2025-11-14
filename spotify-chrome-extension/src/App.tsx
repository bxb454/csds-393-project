import React, { useState } from 'react'
import { useAuth } from './SpotifyAuth.tsx'
import { getCurrentlyPlayingTrack, getTrackDetails } from './SpotifyAPI.tsx'
import './App.css'

// HomePage now accepts a navigation handler (goToSettings)
// HomePage now accepts a navigation handler (goToSettings)
function HomePage({ token, handleLogout, goToSettings }: { token: string, handleLogout: () => void, goToSettings: () => void }) {
  const [track_id, set_track_id] = useState<string | null>(null)
  const [track_name, set_track_name] = useState<string | null>(null)
  const [artist_Name, set_artist_name] = useState<string | null>(null)
  const [album_Art, set_album_art] = useState<string | null>(null)

  // Function to fetch current track
  const fetchCurrentTrack = async () => {
    try {
      const current_track = await getCurrentlyPlayingTrack(token);
      const newTrackId = current_track.data.item.id;
      
      // Only update if track changed
      if (newTrackId !== track_id) {
        set_track_id(newTrackId);
        set_album_art(current_track.data.item.album.images[0].url);
        set_artist_name(current_track.data.item.artists.map((artist: { name: string }) => artist.name).join(", "));
        
        const track = await getTrackDetails(token, newTrackId);
        set_track_name(track.data.name);
      }
    } catch (error) {
      console.error("Error fetching current track:", error);
    }
  };

  // useEffect to set up polling
  React.useEffect(() => {
    // Fetch immediately on mount
    fetchCurrentTrack();

    // Set up interval to fetch every 3 seconds
    const intervalId = setInterval(fetchCurrentTrack, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [token, track_id]); // Re-run if token or track_id changes

  return (
    <div className="homepage-container">
      <div className="top-bar">
        {/* Settings button now uses the navigation handler */}
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
        </div>
      </div>
    </div>
  );
}

// SettingsPage now accepts a navigation handler (goToHome)
function SettingsPage({ goToHome }: { goToHome: () => void }) {
  const [liveThemes, setLiveThemes] = useState(false);
  const [weatherThemes, setWeatherThemes] = useState(false);

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

function App() {
  const { token, handleLogin, handleLogout } = useAuth()
  // Add state to control which screen is currently visible
  const [currentView, setCurrentView] = useState('home');

  const goToSettings = () => setCurrentView('settings');
  const goToHome = () => setCurrentView('home');

  if (!token) {
    return (<div className = "App">
      <LoginPage handleLogin={handleLogin} />
    </div>)
  }
  else {
    // Render SettingsPage if currentView is 'settings'
    if (currentView === 'settings') {
      return (
        <div className="App">
          <SettingsPage goToHome={goToHome} />
        </div>
      )
    }
    
    // Default: Render HomePage
    return (
      <div className="App">
        <HomePage token={token} handleLogout={handleLogout} goToSettings={goToSettings} />
      </div>
    )
  }
}

export default App
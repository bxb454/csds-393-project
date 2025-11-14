import { useState } from 'react'
import { useAuth } from './SpotifyAuth.tsx'
import { getCurrentlyPlayingTrack, getTrackDetails } from './SpotifyAPI.tsx'
import './App.css'


function sendThemeAction(action: "applyRandomTheme" | "applyPlaylistTheme" | "resetTheme", setStatus: (msg: string) => void) {
    if (!chrome?.tabs) {
      setStatus("Chrome tabs API unavailable.");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setStatus("No active tab.");
        return;
      }
      chrome.tabs.sendMessage(tabId, { action }, (response) => {
        if (chrome.runtime.lastError) {
          setStatus(chrome.runtime.lastError.message ?? "Unknown error.");
          return;
        }
        setStatus(response?.status ?? "No response.");
      });
    });
  }

// HomePage now accepts a navigation handler (goToSettings)
function HomePage({ token, handleLogout, goToSettings, goToLLM }: { token: string, handleLogout: () => void, goToSettings: () => void, goToLLM: () => void }) {
  const [track_id, set_track_id] = useState<string | null>(null)
  const [track_name, set_track_name] = useState<string | null>(null)
  const [artist_Name, set_artist_name] = useState<string | null>(null)
  const [album_Art, set_album_art] = useState<string | null>(null)
  //const [themeStatus, setThemeStatus] = useState<string>("");


  getCurrentlyPlayingTrack(token).then(current_track => {
    set_track_id(current_track.data.item.id)
    set_album_art(current_track.data.item.album.images[0].url)
    set_artist_name(current_track.data.item.artists.map((artist: { name: string }) => artist.name).join(", "))
    getTrackDetails(token, track_id as string).then(track => {
      set_track_name(track.data.name)
    })
  })
return (
  <div className="homepage-container">
    <div className="top-bar">
      {/* Settings button now uses the navigation handler */}
      <button className="nav-button left" onClick={goToSettings}>Settings</button>
      <button className="nav-button center" onClick={goToLLM}>LLM-Theming</button>
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
  return (
    <div className="homepage-container">
      <div className="top-bar">
        {/* New "Accept" button to return to HomePage */}
        <button className="nav-button left" onClick={goToHome}>Accept</button>
        <button className="nav-button center">Settings</button>
        <button className="nav-button right" onClick={goToHome}>Close</button> 
      </div>
      <div>
        {/* settings code goes here in a future update*/}
      </div>
    </div>
  )
}

function LLMPage({ goToHome }: { goToHome: () => void }) {
  const [status, setStatus] = useState("");
  return (
    <div className="homepage-container">
      <div className="top-bar">
        <button className="nav-button left" onClick={goToHome}>Back</button>
        <button className="nav-button center">LLM-Theming</button>
        <button className="nav-button right" onClick={() => sendThemeAction("resetTheme", setStatus)}>Reset</button>
      </div>
      <div className="theme-actions">
        {/* Buttons to trigger theme actions */}
        <button onClick={() => sendThemeAction("applyRandomTheme", setStatus)}>Generate Random Theme</button>
        <button onClick={() => sendThemeAction("applyPlaylistTheme", setStatus)}>Generate Playlist Theme</button>
        <button onClick={() => sendThemeAction("resetTheme", setStatus)}>Reset Theme</button>
        <p>{status}</p>
      </div>
    </div>
  );
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
  const goToLLM = () => setCurrentView('llm');

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
    } // Render LLMPage if currentView is 'llm'
    if (currentView === 'llm') {
      return (
      <div className="App">
        <LLMPage goToHome={goToHome} />
      </div>
      )
    }
    // Default: Render HomePage
    return (
      <div className="App">
        <HomePage token={token} handleLogout={handleLogout} goToSettings={goToSettings} goToLLM={goToLLM} />
      </div>
    )
  }
}

export default App
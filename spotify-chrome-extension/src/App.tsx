import { useAuth } from './SpotifyAuth.tsx'
import { getCurrentlyPlayingTrack, getTrackDetails } from './SpotifyAPI.tsx'

function HomePage({ token, handleLogout }: { token: string, handleLogout: () => void }) {
  let t_id = null
  let t_name = null
  getCurrentlyPlayingTrack(token).then(current_track => {
    t_id = current_track.data.item.id
    getTrackDetails(token, t_id).then(track => {
      t_name = track.data.name
    })
  })
  return (
    <div>
      <h1>Welcome to Spotify App</h1>
      <p>You're logged in!</p>
      <p>Access token: <code>{token}</code></p>
      <p>Current track ID: <code>{t_id}</code></p>
      <p>Current track name: <code>{t_name}</code></p>
      <button onClick={handleLogout}>Logout</button>
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
  if (!token) {
    return (<div className = "App">
      <LoginPage handleLogin={handleLogin} />
    </div>)
  }
  else {
    return (
      <div className="App">
        <HomePage token={token} handleLogout={handleLogout} />
      </div>
    )
  }
}

export default App

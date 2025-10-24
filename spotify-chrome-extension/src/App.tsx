import { useAuth } from './Auth.tsx'

function HomePage({ token, handleLogout }: { token: string, handleLogout: () => void }) {
  return (
    <div>
      <h1>Welcome to Spotify App</h1>
      <p>You're logged in!</p>
      <p>Access token: <code>{token}</code></p>
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

  return (
    <div className="App">
      {!token ? (
        <LoginPage handleLogin={handleLogin} />
      ) : (
        <HomePage token={token} handleLogout={handleLogout} />
      )}
    </div>
  )
}

export default App

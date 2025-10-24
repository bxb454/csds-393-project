import { useAuth } from './Auth.tsx'

function App() {
  const {token, handleLogin, handleLogout} = useAuth()

  return (
    <div className="App">
      <h1>Spotify Playback Info</h1>
      {!token ? (
        <button onClick={() => handleLogin()}>Login with Spotify</button>
      ) : (
        <>
          <p>Logged in! Access token:</p>
          <code>{token}</code>
          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  )
}

export default App 

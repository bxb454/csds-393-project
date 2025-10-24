import { useState, useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const RESPONSE_TYPE = 'code'
const SCOPES = 'user-read-playback-state user-read-currently-playing'

function generateRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)

  // Check for token in the URL after redirect
  useEffect(() => {
    let token = window.localStorage.getItem('token')
    if (token) {
        setToken(token)
    }
  }, [])
  
const handleLogin = () => {
  const state = generateRandomString(16);

  //get from current chrome extension environment
  const REDIRECT_URI = chrome.identity.getRedirectURL();
  const params = new URLSearchParams({
    response_type: RESPONSE_TYPE,
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  });

  const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
  
  //use chrome built-in web auth flow
  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    (redirectUrl: string|undefined) => {
      if (redirectUrl) {
        const params = new URLSearchParams(
          redirectUrl.split('#')[1] // Spotify returns token in hash
        );
        const token = params.get('access_token');
        if (token) {
          window.localStorage.setItem('token', token);
          setToken(token);
        }
      }
    }
  );
  console.log("Auth URL: ", authUrl)
  console.log("Redirect URI: ", REDIRECT_URI)
}

  const handleLogout = () => {
    setToken(null)
    window.localStorage.removeItem('token')
  }
    return { token, handleLogin, handleLogout }
}
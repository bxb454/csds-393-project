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
    let token = chrome.storage.local.get(['token'])
    if (token) {
        setToken(String(token))
    }
  }, [])
  
const handleLogin = () => {
  const state = generateRandomString(16);
  const REDIRECT_URI = chrome.identity.getRedirectURL();
  
  const params = new URLSearchParams({
    response_type: RESPONSE_TYPE,
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  });

  const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
  
  console.log("Auth URL: ", authUrl)
  console.log("Redirect URI: ", REDIRECT_URI)
  
  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    (redirectUrl: string|undefined) => {
      console.log("Callback fired!");
      console.log("Redirect URL received: ", redirectUrl);
      
      if (chrome.runtime.lastError) {
        console.error('Chrome identity error:', chrome.runtime.lastError);
        return;
      }
      
      if (redirectUrl) {
        console.log("Full redirect URL: ", redirectUrl);
        
        // Check if using 'code' flow
        if (redirectUrl.includes('code=')) {
          const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
          console.log("Code: ", urlParams.get('code'));
        }
        
        // Check if using 'token' flow
        if (redirectUrl.includes('#')) {
          const params = new URLSearchParams(redirectUrl.split('#')[1]);
          const token = params.get('access_token');
          console.log("Access token: ", token);
          
          if (token) {
            chrome.storage.local.set({ token: token });
            setToken(token);
            console.log("Token saved!");
          }
        }
      } else {
        console.log("No redirect URL received");
      }
    }
  );
}

  const handleLogout = () => {
    setToken(null)
    chrome.storage.local.remove(['token'])
  }
    return { token, handleLogin, handleLogout }
}
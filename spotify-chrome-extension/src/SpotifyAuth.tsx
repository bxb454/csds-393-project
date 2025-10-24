import { useState, useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const RESPONSE_TYPE = 'code'
const SCOPES = 'user-read-playback-state user-read-currently-playing'

function generateRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
}

//Spotify recommended SHA-256 hashing for PKCE
const sha256 = async (plain: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

//Spotify recommended encoding for PKCE
const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

//PKCE token exchange function
async function exchangeCodeForToken(
  code: string, 
  codeVerifier: string, 
  redirectUri: string
): Promise<string | null> {
  const tokenParams = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  
  try {
    console.log("Exchanging code for token...");
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });
    
    const data = await response.json();
    console.log("Token response: ", data);
    
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("No access token in response:", data);
      return null;
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return null;
  }
}
export function useAuth() {
  const [token, setToken] = useState<string | null>(null)

  // Check for token in the URL after redirect
  useEffect(() => {
    chrome.storage.local.get(['token'], (result) => {
      console.log("Loaded token from storage:", result.token);
      if (result.token) {
        setToken(result.token)
      } else {
        setToken(null)  // Important: explicitly set to null if no token
      }
    })
  }, [])
  
  const handleLogin = async () => {
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);
    
    await chrome.storage.local.set({ code_verifier: codeVerifier });
    
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    
    const REDIRECT_URI = chrome.identity.getRedirectURL();
    
    const params = new URLSearchParams({
      response_type: RESPONSE_TYPE,
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
    
    console.log("Auth URL: ", authUrl)
    console.log("Redirect URI: ", REDIRECT_URI)
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      async (redirectUrl: string|undefined) => {
        console.log("Callback fired!");
        console.log("Redirect URL received: ", redirectUrl);
        
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          return;
        }
        
        if (redirectUrl) {
          console.log("Full redirect URL: ", redirectUrl);
          
          const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
          const code = urlParams.get('code');
          console.log("Code extracted: ", code);
          
          if (code) {
            chrome.storage.local.get(['code_verifier'], async (result) => {
              const codeVerifier = result.code_verifier;
              console.log("Code verifier retrieved:", codeVerifier);
              
              // USE THE NEW FUNCTION
              const accessToken = await exchangeCodeForToken(
                code, 
                codeVerifier, 
                chrome.identity.getRedirectURL()
              );
              
              if (accessToken) {
                await chrome.storage.local.set({ token: accessToken });
                await chrome.storage.local.remove('code_verifier');
                setToken(accessToken);
                console.log("Token saved and state updated!");
              }
            });
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
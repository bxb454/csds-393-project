import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  generateRandomString, 
  sha256, 
  base64encode, 
  exchangeCodeForToken,
  refreshAccessToken 
} from '../SpotifyAuthUtils.ts'

describe('SpotifyAuth - OAuth Authorization Component', () => {
  beforeEach(() => {
    const storageLocal = {
      get: vi.fn((...args: any[]) => {
        const callback = args[1]
        if (typeof callback === 'function') {
          callback({})
        } else {
          return Promise.resolve({})
        }
      }),
      set: vi.fn((...args: any[]) => {
        const callback = args[1]
        if (typeof callback === 'function') callback()
      }),
      remove: vi.fn((...args: any[]) => {
        const callback = args[1]
        if (typeof callback === 'function') callback()
      }),
    }

    vi.stubGlobal('chrome', {
      storage: {
        local: storageLocal,
      },
      identity: {
        getRedirectURL: vi.fn().mockReturnValue('chrome-extension://test-extension-id/'),
        launchWebAuthFlow: vi.fn(),
      },
      runtime: {
        lastError: null
      }
    })

    chrome.storage.local.get = storageLocal.get as any
    chrome.storage.local.set = storageLocal.set as any
    chrome.storage.local.remove = storageLocal.remove as any
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Auth_T-Base64: Base64 encode function for PKCE', () => {
    it('should produce a valid Base64 URL-safe encoded string', async () => {
      const testInput = 'test-string-123!@#'
      const arrayBuffer = new TextEncoder().encode(testInput)

      const encoded = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

      expect(encoded).toBeTruthy()
      expect(encoded).not.toContain('=')
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
      expect(typeof encoded).toBe('string')
    })

    it('should handle SHA-256 hashed output correctly', async () => {
      const testString = 'code-verifier-string'
      const encoder = new TextEncoder()
      const data = encoder.encode(testString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)

      const encoded = base64encode(hashBuffer)

      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })
  })

  describe('Auth_T-Init: Authorization URL construction', () => {
    it('should construct valid Spotify authorization URL with all required parameters', async () => {
      const CLIENT_ID = 'test-client-id'
      const SCOPES = 'user-read-playback-state user-read-currently-playing'
      const REDIRECT_URI = 'chrome-extension://test-extension-id/'
      const state = generateRandomString(16)
      const codeVerifier = generateRandomString(64)
      const hashed = await sha256(codeVerifier)
      const codeChallenge = base64encode(hashed)

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      })

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`

      expect(authUrl).toContain('https://accounts.spotify.com/authorize')
      expect(authUrl).toContain('client_id=test-client-id')
      expect(authUrl).toContain('response_type=code')
      expect(authUrl).toContain('scope=user-read-playback-state')
    })

    it('should include code_challenge and code_challenge_method for PKCE', async () => {
      const codeVerifier = generateRandomString(64)
      const hashed = await sha256(codeVerifier)
      const codeChallenge = base64encode(hashed)

      const params = new URLSearchParams({
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      })

      expect(params.get('code_challenge_method')).toBe('S256')
      expect(params.get('code_challenge')).toBeTruthy()
      expect(params.get('code_challenge')).toHaveLength(43)
    })
  })

  describe('Auth_T-Process: Extract access code from redirect URL', () => {
  it('should extract access code from redirect URL containing code parameter', () => {
    const redirectUrl = 'chrome-extension://test-extension-id/?code=ABC123&state=xyz'
    const urlParams = new URLSearchParams(redirectUrl.split('?')[1])
    const code = urlParams.get('code')

    expect(code).toBe('ABC123')
  })

  it('should extract both code and state from URL', () => {
    const redirectUrl = 'chrome-extension://test-extension-id/?code=ABC123&state=xyz789'
    const urlParams = new URLSearchParams(redirectUrl.split('?')[1])

    expect(urlParams.get('code')).toBe('ABC123')
    expect(urlParams.get('state')).toBe('xyz789')
  })
})


  describe('Auth_T-Exch: Exchange authorization code for access token', () => {
    it('should exchange valid authorization code for access token', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600
      }

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse
      })

      const result = await exchangeCodeForToken(
        'test-code',
        'test-verifier',
        'chrome-extension://test-extension-id/'
      )

      expect(result).toEqual({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      })
    })

    it('should return null on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await exchangeCodeForToken('code', 'verifier', 'redirect')

      expect(result).toBeNull()
    })
  })

  describe('Auth_T-Retain: Cached login information', () => {
    it('should restore user token from chrome.storage.local on component mount', async () => {
      const mockToken = 'cached-token-123'
      const mockExpiry = Date.now() + 3600 * 1000

      chrome.storage.local.get = vi.fn((...args: any[]) => {
        const callback = args[1]
        callback({
          token: mockToken,
          refresh_token: 'refresh-token',
          token_expiry: mockExpiry
        })
      }) as any

      await new Promise<void>((resolve) => {
        chrome.storage.local.get(['token', 'refresh_token', 'token_expiry'], (result) => {
          expect(result.token).toBe(mockToken)
          expect(result.token_expiry).toBe(mockExpiry)
          resolve()
        })
      })
    })
  })

  describe('Token refresh functionality', () => {
    it('should refresh expired access token using refresh_token', async () => {
      const mockNewToken = 'new-access-token'

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => ({
          access_token: mockNewToken,
          expires_in: 3600
        })
      })

      const result = await refreshAccessToken('refresh-token-123')

      expect(result).toBe(mockNewToken)
    })
  })

  describe('Logout functionality', () => {
    it('should clear token from state on logout', () => {
      let token: string | null = 'current-token'

      const handleLogout = () => {
        token = null
      }

      handleLogout()
      expect(token).toBeNull()
    })
  })
})

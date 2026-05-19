/**
 * LINE Login Integration for RouteFlow
 * Implements LINE OAuth 2.0 flow for authentication
 */

// LINE Login endpoints
const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';

export interface LINEConfig {
  channelId: string;
  channelSecret: string;
  redirectUri: string;
  state: string;
}

export interface LINETokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

export interface LINEProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LINELoginResult {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate LINE Login authorization URL
 * User is redirected to this URL to authenticate with LINE
 */
export function getLINEAuthUrl(config: LINEConfig): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.channelId,
    redirect_uri: config.redirectUri,
    state: config.state,
    scope: 'profile openid', // Request profile info
  });

  return `${LINE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * This should be called server-side to keep channelSecret secure
 */
export async function exchangeCodeForToken(
  code: string,
  config: Omit<LINEConfig, 'state'>
): Promise<LINELoginResult> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.channelId,
    client_secret: config.channelSecret,
  });

  const response = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LINE token exchange failed: ${error}`);
  }

  const tokenData: LINETokenResponse = await response.json();

  // Get user profile
  const profile = await getLINEProfile(tokenData.access_token);

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
  };
}

/**
 * Get LINE user profile using access token
 */
export async function getLINEProfile(accessToken: string): Promise<LINEProfile> {
  const response = await fetch(LINE_PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get LINE profile');
  }

  return response.json();
}

/**
 * Verify access token validity
 */
export async function verifyLINEAccessToken(
  accessToken: string,
  clientId: string
): Promise<{ client_id: string; expires_in: number }> {
  const response = await fetch(`${LINE_VERIFY_URL}?access_token=${accessToken}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Invalid or expired LINE access token');
  }

  const data = await response.json();
  
  if (data.client_id !== clientId) {
    throw new Error('LINE token client ID mismatch');
  }

  return data;
}

/**
 * Refresh LINE access token
 */
export async function refreshLINEToken(
  refreshToken: string,
  config: Omit<LINEConfig, 'state' | 'redirectUri'>
): Promise<LINETokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.channelId,
    client_secret: config.channelSecret,
  });

  const response = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh LINE token');
  }

  return response.json();
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  } else {
    // Node.js fallback
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate state parameter to prevent CSRF attacks
 */
export function validateState(expectedState: string, receivedState: string): boolean {
  if (!expectedState || !receivedState) return false;
  
  // Use timing-safe comparison
  if (expectedState.length !== receivedState.length) return false;
  
  let result = 0;
  for (let i = 0; i < expectedState.length; i++) {
    result |= expectedState.charCodeAt(i) ^ receivedState.charCodeAt(i);
  }
  
  return result === 0;
}

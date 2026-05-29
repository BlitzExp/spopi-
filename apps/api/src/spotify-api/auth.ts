import type { SpotifyTokenResponse } from "./types";

type TokenCache = {
  token: string;
  expiresAt: number;
};

const AUTH_FAILURE_COOLDOWN_MS = 5 * 60 * 1000;
const TOKEN_REQUEST_TIMEOUT_MS = 5_000;

let tokenCache: TokenCache | null = null;
let authFailureUntil = 0;
let tokenRequest: Promise<string | null> | null = null;

export function isSpotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID?.trim() && process.env.SPOTIFY_CLIENT_SECRET?.trim(),
  );
}

export async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) return null;

  if (Date.now() < authFailureUntil) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  if (tokenRequest) return tokenRequest;

  tokenRequest = requestSpotifyAccessToken(clientId, clientSecret);

  try {
    return await tokenRequest;
  } finally {
    tokenRequest = null;
  }
}

async function requestSpotifyAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  let response: Response;

  try {
    response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
    });
  } catch {
    authFailureUntil = Date.now() + AUTH_FAILURE_COOLDOWN_MS;
    return null;
  }

  if (!response.ok) {
    authFailureUntil = Date.now() + AUTH_FAILURE_COOLDOWN_MS;
    return null;
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  authFailureUntil = 0;

  return data.access_token;
}

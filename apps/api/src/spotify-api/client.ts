import { getSpotifyAccessToken } from "./auth";
import { fetchWithRateLimit, sleep } from "./rateLimit";
import type { SpotifyArtistSearchResponse } from "./types";

const REQUEST_DELAY_MS = 300;
const API_REQUEST_TIMEOUT_MS = 8_000;

export async function searchArtistByName(
  artistName: string,
): Promise<SpotifyArtistSearchResponse | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  const query = encodeURIComponent(artistName);
  const url = `https://api.spotify.com/v1/search?q=artist:${query}&type=artist&limit=1`;

  await sleep(REQUEST_DELAY_MS);

  let response: Response;
  try {
    response = await fetchWithRateLimit(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  return (await response.json()) as SpotifyArtistSearchResponse;
}

export async function searchArtistsByGenre(
  genre: string,
  limit = 5,
): Promise<SpotifyArtistSearchResponse | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  const query = encodeURIComponent(genre);
  const url = `https://api.spotify.com/v1/search?q=genre:${query}&type=artist&limit=${limit}`;

  await sleep(REQUEST_DELAY_MS);

  let response: Response;
  try {
    response = await fetchWithRateLimit(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  return (await response.json()) as SpotifyArtistSearchResponse;
}

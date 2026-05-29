import { getCachedArtists, saveArtistMetadata } from "./artistCache";
import { searchArtistByName } from "./client";
import { normalizeArtistName } from "./normalize";
import { isSpotifyConfigured } from "./auth";
import type { EnrichedArtist } from "./types";

const BATCH_SIZE = 5;
const DEFAULT_MAX_FETCH = 50;

function toEnrichedArtist(artistName: string, item: {
  id: string;
  genres: string[];
  images: Array<{ url: string }>;
} | null): EnrichedArtist {
  return {
    artistName: normalizeArtistName(artistName),
    spotifyArtistId: item?.id ?? null,
    genres: item?.genres ?? [],
    imageUrl: item?.images[0]?.url ?? null,
  };
}

async function fetchArtistMetadata(originalName: string): Promise<EnrichedArtist> {
  const searchResult = await searchArtistByName(originalName);
  const item = searchResult?.artists.items[0] ?? null;
  return toEnrichedArtist(originalName, item);
}

export async function enrichArtists(
  artistNames: string[],
  options?: { maxFetch?: number },
): Promise<Map<string, EnrichedArtist>> {
  const maxFetch = options?.maxFetch ?? DEFAULT_MAX_FETCH;
  const uniqueNames = [...new Set(artistNames.map((name) => name.trim()).filter(Boolean))];
  const result = new Map<string, EnrichedArtist>();

  if (uniqueNames.length === 0) return result;

  const cached = await getCachedArtists(uniqueNames);
  const missing: string[] = [];

  for (const name of uniqueNames) {
    const key = normalizeArtistName(name);
    const cachedArtist = cached.get(key);
    if (cachedArtist) {
      result.set(key, cachedArtist);
    } else {
      missing.push(name);
    }
  }

  if (!isSpotifyConfigured() || missing.length === 0) {
    return result;
  }

  const toFetch = missing.slice(0, maxFetch);

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const enrichedBatch = await Promise.all(
      batch.map(async (artistName) => {
        try {
          return await fetchArtistMetadata(artistName);
        } catch {
          return {
            artistName: normalizeArtistName(artistName),
            spotifyArtistId: null,
            genres: [],
            imageUrl: null,
          };
        }
      }),
    );

    await Promise.all(enrichedBatch.map((artist) => saveArtistMetadata(artist)));

    for (const artist of enrichedBatch) {
      result.set(artist.artistName, artist);
    }
  }

  return result;
}

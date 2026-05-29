import type { NormalizedListeningEvent } from "../spotify/types";
import type { AnalyticsSummary, MonthlyTrend } from "./types";
import { incrementAggregate, monthKey, msToMinutes, toSortedTop } from "./utils";

const TOP_LIMIT = 10;

export function computeAnalytics(
  events: NormalizedListeningEvent[],
): AnalyticsSummary {
  const artistAgg = new Map<string, { streams: number; msPlayed: number }>();
  const trackAgg = new Map<string, { streams: number; msPlayed: number }>();
  const monthlyAgg = new Map<string, { streams: number; msPlayed: number }>();

  const uniqueArtists = new Set<string>();
  const uniqueTracks = new Set<string>();
  const uniqueAlbums = new Set<string>();

  let totalMs = 0;

  for (const event of events) {
    totalMs += event.msPlayed;
    uniqueArtists.add(event.artist);
    uniqueTracks.add(`${event.artist}::${event.track}`);
    if (event.album) uniqueAlbums.add(`${event.artist}::${event.album}`);

    incrementAggregate(artistAgg, event.artist, event.msPlayed);
    incrementAggregate(trackAgg, `${event.track} - ${event.artist}`, event.msPlayed);
    incrementAggregate(monthlyAgg, monthKey(event.timestamp), event.msPlayed);
  }

  const monthlyListeningTrends: MonthlyTrend[] = Array.from(monthlyAgg.entries())
    .map(([month, value]) => ({
      month,
      streams: value.streams,
      minutes: msToMinutes(value.msPlayed),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalListeningMinutes: msToMinutes(totalMs),
    totalStreams: events.length,
    uniqueArtists: uniqueArtists.size,
    uniqueTracks: uniqueTracks.size,
    uniqueAlbums: uniqueAlbums.size,
    topArtists: toSortedTop(artistAgg, TOP_LIMIT),
    topTracks: toSortedTop(trackAgg, TOP_LIMIT),
    topGenres: [],
    monthlyListeningTrends,
    genreTags: [],
    artistGenres: {},
  };
}

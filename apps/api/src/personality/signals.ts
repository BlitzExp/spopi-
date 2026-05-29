import type { NormalizedListeningEvent } from "../spotify/types";
import type { AnalyticsSummary } from "../analytics/types";
import type { ListeningSignals } from "./types";

const SESSION_GAP_MS = 30 * 60 * 1000;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function computeSessions(events: NormalizedListeningEvent[]): number[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const sizes: number[] = [];
  let currentSize = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1].timestamp).getTime();
    const next = new Date(sorted[i].timestamp).getTime();
    if (next - prev <= SESSION_GAP_MS) {
      currentSize += 1;
    } else {
      sizes.push(currentSize);
      currentSize = 1;
    }
  }

  sizes.push(currentSize);
  return sizes;
}

export function extractListeningSignals(
  events: NormalizedListeningEvent[],
  analytics: AnalyticsSummary,
): ListeningSignals {
  const totalStreams = events.length || 1;
  const trackCounts = new Map<string, number>();
  const artistCounts = new Map<string, number>();
  let lateNight = 0;
  let autumn = 0;

  for (const event of events) {
    const trackKey = `${event.artist}::${event.track}`;
    trackCounts.set(trackKey, (trackCounts.get(trackKey) ?? 0) + 1);
    artistCounts.set(event.artist, (artistCounts.get(event.artist) ?? 0) + 1);

    const hour = new Date(event.timestamp).getUTCHours();
    if (hour >= 22 || hour < 5) lateNight += 1;

    const month = Number(event.timestamp.slice(5, 7));
    if (month >= 9 && month <= 11) autumn += 1;
  }

  const replayedTracks = [...trackCounts.values()].filter((count) => count > 1).length;
  const replayRatio = clamp(replayedTracks / Math.max(trackCounts.size, 1));

  const nicheArtists = [...artistCounts.values()].filter((count) => count <= 3).length;
  const nicheArtistShare = clamp(nicheArtists / Math.max(artistCounts.size, 1));

  const genreDiversity = 0;

  const topArtistMinutes = analytics.topArtists[0]?.minutes ?? 0;
  const artistLoyalty = clamp(topArtistMinutes / Math.max(analytics.totalListeningMinutes, 1));

  const topTrackShare = clamp((analytics.topTracks[0]?.streams ?? 0) / totalStreams);

  const activeMonths = analytics.monthlyListeningTrends.filter((month) => month.streams > 0).length;
  const monthlyConsistency = clamp(activeMonths / Math.max(analytics.monthlyListeningTrends.length, 1));

  const sessionSizes = computeSessions(events);
  const avgSessionSize = sessionSizes.length
    ? sessionSizes.reduce((sum, size) => sum + size, 0) / sessionSizes.length
    : 0;

  const monthMinutes = analytics.monthlyListeningTrends.map((month) => month.minutes);
  const monthAvg =
    monthMinutes.length > 0
      ? monthMinutes.reduce((sum, value) => sum + value, 0) / monthMinutes.length
      : 0;
  const monthVariance =
    monthMinutes.length > 0
      ? monthMinutes.reduce((sum, value) => sum + (value - monthAvg) ** 2, 0) / monthMinutes.length
      : 0;
  const moodVolatility = clamp(Math.sqrt(monthVariance) / Math.max(monthAvg, 1));

  const topTenStreams = analytics.topArtists
    .slice(0, 10)
    .reduce((sum, artist) => sum + artist.streams, 0);
  const longTailShare = clamp(1 - topTenStreams / totalStreams);

  const uniqueArtistRatio = clamp(analytics.uniqueArtists / Math.max(totalStreams / 4, 1));

  return {
    lateNightShare: lateNight / totalStreams,
    replayRatio,
    topTrackShare,
    genreDiversity,
    artistLoyalty,
    nicheArtistShare,
    monthlyConsistency,
    avgSessionSize: clamp(avgSessionSize / 12),
    moodVolatility,
    autumnShare: autumn / totalStreams,
    indieGenreShare: 0,
    hyperpopShare: 0,
    dreamPopShare: 0,
    energyGenreShare: 0,
    longTailShare,
    uniqueArtistRatio,
  };
}

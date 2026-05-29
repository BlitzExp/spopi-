export type TopItem = {
  name: string;
  streams: number;
  minutes: number;
};

export type TopGenre = {
  genre: string;
  streams: number;
  minutes: number;
};

export type ArtistGenreInfo = {
  genres: string[];
  imageUrl: string | null;
};

export type MonthlyTrend = {
  month: string;
  streams: number;
  minutes: number;
};

export type AnalyticsSummary = {
  totalListeningMinutes: number;
  totalStreams: number;
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  topArtists: TopItem[];
  topTracks: TopItem[];
  topGenres: TopGenre[];
  monthlyListeningTrends: MonthlyTrend[];
  genreTags: string[];
  artistGenres: Record<string, ArtistGenreInfo>;
};

export type PersonalityArchetype = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  score: number;
  isDominant: boolean;
};

export type PersonalityAnalysis = {
  dominantId: string;
  dominantName: string;
  headline: string;
  commentary: string;
  archetypes: PersonalityArchetype[];
};

export type AnalyticsUploadResponse = {
  ok: true;
  streamingHistoryFiles: string[];
  eventCount: number;
  analytics: AnalyticsSummary;
  personality: PersonalityAnalysis;
};

export type ApiErrorResponse = {
  error?: { message?: string };
};


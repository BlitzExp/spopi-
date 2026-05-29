export type RecommendationCandidate = {
  spotifyArtistId: string;
  name: string;
  genres: string[];
  imageUrl: string | null;
  popularity: number;
  seedArtist: string;
  source: "genre-search";
};

export type ArtistRecommendation = {
  artistName: string;
  spotifyArtistId: string;
  imageUrl: string | null;
  genres: string[];
  explanation: string;
  reason: string;
  label: string;
};

export type RecommendationInput = {
  topGenres: string[];
  topArtists: string[];
  listenedArtists: Set<string>;
  dominantPersonalityId: string;
  dominantPersonalityName: string;
  lateNightShare: number;
  nicheArtistShare: number;
};

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type SpotifyArtistSearchItem = {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height: number | null; width: number | null }>;
};

export type SpotifyArtistSearchResponse = {
  artists: {
    items: SpotifyArtistSearchItem[];
  };
};

export type EnrichedArtist = {
  artistName: string;
  spotifyArtistId: string | null;
  genres: string[];
  imageUrl: string | null;
};

import { normalizeArtistName } from "../spotify-api/normalize";
import type { RecommendationCandidate, RecommendationInput } from "./types";

export function isAlreadyListened(name: string, listenedArtists: Set<string>): boolean {
  return listenedArtists.has(normalizeArtistName(name));
}

export function genreOverlapScore(candidateGenres: string[], topGenres: string[]): number {
  if (topGenres.length === 0 || candidateGenres.length === 0) return 0;

  const top = topGenres.map((genre) => genre.toLowerCase());
  let score = 0;

  for (const genre of candidateGenres) {
    const lower = genre.toLowerCase();
    if (top.some((target) => lower.includes(target) || target.includes(lower))) {
      score += 1;
    }
  }

  return score / Math.max(candidateGenres.length, 1);
}

export function discoveryScore(popularity: number, nicheArtistShare: number): number {
  const ideal = nicheArtistShare > 0.35 ? 45 : 60;
  const distance = Math.abs(popularity - ideal);
  return Math.max(0, 1 - distance / 100);
}

export function personalityGenreBoost(
  personalityId: string,
  candidateGenres: string[],
): number {
  const haystack = candidateGenres.join(" ").toLowerCase();

  const matches: Record<string, string[]> = {
    "night-owl": ["indie", "dream pop", "bedroom", "alternative"],
    "indie-explorer": ["indie", "alternative", "folk"],
    "dream-pop-drifter": ["dream pop", "shoegaze", "ambient"],
    "hyperpop-maximalist": ["hyperpop", "electronic", "experimental"],
    "energy-spike-listener": ["edm", "dance", "hyperpop", "punk"],
    "sad-girl-autumn": ["indie", "folk", "singer-songwriter"],
    "underground-scout": ["indie", "alternative", "experimental"],
    "chaos-listener": ["experimental", "alternative", "electronic"],
  };

  const keywords = matches[personalityId] ?? ["indie", "alternative"];
  return keywords.some((keyword) => haystack.includes(keyword)) ? 1 : 0.35;
}

export function scoreCandidate(
  candidate: RecommendationCandidate,
  input: RecommendationInput,
): number {
  const overlap = genreOverlapScore(candidate.genres, input.topGenres);
  const personality = personalityGenreBoost(input.dominantPersonalityId, candidate.genres);
  const discovery = discoveryScore(candidate.popularity, input.nicheArtistShare);

  return overlap * 0.5 + personality * 0.3 + discovery * 0.2;
}

export function buildRecommendationCopy(
  candidate: RecommendationCandidate,
  input: RecommendationInput,
): { explanation: string; reason: string; label: string } {
  const topGenre = input.topGenres[0] ?? "your favorite genres";
  const seed = candidate.seedArtist;
  const isLateNight = input.lateNightShare > 0.2;

  if (isLateNight && input.dominantPersonalityId === "night-owl") {
    return {
      label: "Late-Night Discovery",
      explanation: `${candidate.name} matches your after-hours indie mood.`,
      reason: `You got ${candidate.name} because you heavily listen to emotional ${topGenre} artists late at night.`,
    };
  }

  if (input.dominantPersonalityId === "indie-explorer") {
    return {
      label: "Hidden Gem Alert",
      explanation: `A deep-cut artist from your ${seed} lane.`,
      reason: `You got ${candidate.name} because your indie explorer streak lines up with ${seed}.`,
    };
  }

  if (input.dominantPersonalityId === "underground-scout") {
    return {
      label: "Off-Chart Pick",
      explanation: "Not obvious, but weirdly perfect for your taste.",
      reason: `You got ${candidate.name} because your listening history favors interesting artists outside the mainstream.`,
    };
  }

  if (input.dominantPersonalityId === "dream-pop-drifter") {
    return {
      label: "Soft Focus Find",
      explanation: "Hazy textures that fit your drift.",
      reason: `You got ${candidate.name} because your dream-pop listening patterns point toward similar atmospheric artists.`,
    };
  }

  return {
    label: "Curated For You",
    explanation: `Pulled from ${seed} and your top ${topGenre} rotation.`,
    reason: `You got ${candidate.name} because your favorites in ${topGenre} and ${input.dominantPersonalityName} energy align here.`,
  };
}

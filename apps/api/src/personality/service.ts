import type { NormalizedListeningEvent } from "../spotify/types";
import type { AnalyticsSummary } from "../analytics/types";
import { buildDominantCommentary, PERSONALITY_DEFINITIONS } from "./scoring";
import { extractListeningSignals } from "./signals";
import type { PersonalityAnalysis, PersonalityArchetype } from "./types";

export function analyzePersonalities(
  events: NormalizedListeningEvent[],
  analytics: AnalyticsSummary,
): PersonalityAnalysis {
  const signals = extractListeningSignals(events, analytics);

  const scored: PersonalityArchetype[] = PERSONALITY_DEFINITIONS.map((definition) => ({
    id: definition.id,
    name: definition.name,
    tagline: definition.tagline,
    description: definition.description,
    icon: definition.icon,
    score: definition.score(signals),
    isDominant: false,
  })).sort((a, b) => b.score - a.score);

  if (scored.length > 0) scored[0].isDominant = true;

  const dominant = scored[0];
  const topArtist = analytics.topArtists[0]?.name ?? "your top artist";
  const commentary = buildDominantCommentary(dominant.id, signals, topArtist);

  return {
    dominantId: dominant.id,
    dominantName: dominant.name,
    headline: commentary.headline,
    commentary: commentary.commentary,
    archetypes: scored,
  };
}

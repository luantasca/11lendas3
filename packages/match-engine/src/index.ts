/**
 * API pública do pacote @manager/match-engine.
 *
 * Motor de partidas independente da interface (GDD §103), com simulação
 * determinística por seed (GDD §104).
 *
 * Status: etapa 2 do roadmap — estado da partida e ciclo de simulação
 * (1 ciclo = 1 segundo). Ver packages/match-engine/README.md e
 * docs/03-ROADMAP.md.
 */

// --- Infraestrutura determinística (etapa 1) ---
export { createRng } from "./rng.js";
export type { Rng } from "./rng.js";

// --- Estado e ciclo de simulação (etapa 2) ---
export { createMatchEngine } from "./engine.js";
export type { MatchEngine } from "./engine.js";
export { MATCH_DURATION_SECONDS } from "./match-state.js";
export type {
  BallPosition,
  MatchConfig,
  MatchState,
  MatchStatus,
  PossessionPhase,
  Pressing,
  Tempo,
} from "./match-state.js";

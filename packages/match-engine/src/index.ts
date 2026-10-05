/**
 * API pública do pacote @manager/match-engine.
 *
 * Motor de partidas independente da interface (GDD §103), com simulação
 * determinística por seed (GDD §104).
 *
 * Status: etapa 3 do roadmap — resolução de ações por atributos
 * (passe, drible, finalização — GDD §55). Ver packages/match-engine/README.md
 * e docs/03-ROADMAP.md.
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

// --- Jogador e ações por atributos (etapa 3) ---
export type { Player, PlayerAttributes, PreferredFoot } from "./player.js";
export {
  calcDribbleChance,
  calcPassChance,
  calcShotChance,
  resolveDribble,
  resolvePass,
  resolveShot,
} from "./actions.js";
export type {
  DribbleContext,
  PassContext,
  ActionResult,
  ShotContext,
} from "./actions.js";

/**
 * API pública do pacote @manager/match-engine.
 *
 * Motor de partidas independente da interface (GDD §103), com simulação
 * determinística por seed (GDD §104).
 *
 * Status: integração do ciclo concluída — o tick() gera jogadas, gols,
 * eventos, estatísticas e notas (ADR-012). Próxima: etapa 7, prova de
 * conceito (GDD §113–114). Ver packages/match-engine/README.md e
 * docs/03-ROADMAP.md.
 */

// --- Infraestrutura determinística (etapa 1) ---
export { createRng } from "./rng.js";
export type { Rng } from "./rng.js";

// --- Estado e ciclo de simulação (etapa 2 + integração, ADR-012) ---
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

// --- Eventos, xG e estatísticas (etapa 5) ---
export { criarEvento } from "./events.js";
export type { MatchEvent, MatchEventMetadata, MatchEventType } from "./events.js";
export { calcularXg } from "./xg.js";
export type { ShotType } from "./xg.js";
export { computeMatchStats } from "./stats.js";
export type { MatchStats, MatchStatsInput, TeamStats } from "./stats.js";

// --- Nota dos jogadores (etapa 6) ---
export {
  RATING_INITIAL,
  RATING_MAX,
  RATING_MIN,
  computePlayerRatings,
  getRatingContributions,
} from "./rating.js";
export type { RatingContribution } from "./rating.js";

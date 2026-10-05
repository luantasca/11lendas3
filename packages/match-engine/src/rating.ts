/**
 * Nota dos jogadores — etapa 6 do motor.
 *
 * Referências do GDD:
 * - §61: "Nota inicial: 6.0. Ações positivas aumentam. Ações negativas
 *   diminuem. Escala: 1.0 – 10.0."
 * - §92: campo `rating` em match_player_stats.
 * - §91/§59: a nota é derivada dos eventos da partida (etapa 5).
 *
 * Decisões documentadas (ADR-011):
 * - Os pesos por ação NÃO existem no GDD: são constantes PROVISÓRIAS,
 *   ajustáveis por playtest.
 * - Contratos de atribuição dos eventos:
 *   GOAL → playerId = marcador; secondaryPlayerId = assistidor.
 *   SAVE  → playerId = goleiro; secondaryPlayerId = finalizador.
 * - Jogador sem ações relevantes mantém a nota inicial 6.0.
 * - Sem penalização de gol sofrido para a defesa (os eventos não
 *   identificam quem errou) — limitação documentada.
 */
import type { MatchEvent } from "./events.js";

/** Nota inicial de todo jogador (GDD §61). */
export const RATING_INITIAL = 6.0;

/** Nota mínima da escala (GDD §61). */
export const RATING_MIN = 1.0;

/** Nota máxima da escala (GDD §61). */
export const RATING_MAX = 10.0;

// ---------------------------------------------------------------------------
// Pesos PROVISÓRIOS por ação (ADR-011 — ajustar por playtest)
// ---------------------------------------------------------------------------
const DELTA_GOL = 0.8;
const DELTA_ASSISTENCIA = 0.4;
const DELTA_DEFESA = 0.3; // goleiro que defendeu (SAVE.playerId)
const DELTA_CHUTE_DEFENDIDO = -0.1; // finalizador (SAVE.secondaryPlayerId)
const DELTA_PASSE_COMPLETO = 0.03;
const DELTA_PASSE_FALHO = -0.05;
const DELTA_CHUTE_FORA = -0.15; // SHOT com noGol === false
const DELTA_TACKLE = 0.1;
const DELTA_FALTA = -0.1;
const DELTA_CARTAO_AMARELO = -0.3;
const DELTA_CARTAO_VERMELHO = -0.8;
const DELTA_IMPEDIMENTO = -0.1;

/** Efeito de uma ação na nota de um jogador. */
export interface RatingContribution {
  playerId: string;
  /** Variação aplicada à nota (positiva ou negativa). */
  delta: number;
  /** Motivo em PT-BR — útil para depuração e narração futura (§42). */
  reason: string;
}

function clamp(nota: number): number {
  return Math.min(RATING_MAX, Math.max(RATING_MIN, nota));
}

/**
 * Converte um evento nas contribuições de nota dos jogadores envolvidos
 * (GDD §61: ações positivas aumentam, negativas diminuem).
 *
 * Eventos neutros (INJURY, CORNER, SUBSTITUTION, SHOT sem metadados...)
 * retornam lista vazia. Contratos de atribuição: ver cabeçalho (ADR-011).
 *
 * @param evento evento da partida (etapa 5).
 * @returns contribuições com playerId, delta e motivo.
 */
export function getRatingContributions(evento: MatchEvent): RatingContribution[] {
  const contribuicoes: RatingContribution[] = [];
  const { playerId, secondaryPlayerId, metadata } = evento;

  switch (evento.type) {
    case "GOAL":
      if (playerId) {
        contribuicoes.push({ playerId, delta: DELTA_GOL, reason: "Gol" });
      }
      if (secondaryPlayerId) {
        contribuicoes.push({
          playerId: secondaryPlayerId,
          delta: DELTA_ASSISTENCIA,
          reason: "Assistência",
        });
      }
      break;

    case "SAVE":
      // playerId = goleiro; secondaryPlayerId = finalizador (ADR-011).
      if (playerId) {
        contribuicoes.push({ playerId, delta: DELTA_DEFESA, reason: "Defesa" });
      }
      if (secondaryPlayerId) {
        contribuicoes.push({
          playerId: secondaryPlayerId,
          delta: DELTA_CHUTE_DEFENDIDO,
          reason: "Chute defendido",
        });
      }
      break;

    case "PASS":
      if (playerId && metadata?.sucesso === true) {
        contribuicoes.push({
          playerId,
          delta: DELTA_PASSE_COMPLETO,
          reason: "Passe completo",
        });
      } else if (playerId && metadata?.sucesso === false) {
        contribuicoes.push({
          playerId,
          delta: DELTA_PASSE_FALHO,
          reason: "Passe falho",
        });
      }
      break;

    case "SHOT":
      // Chute fora do gol diminui; chute no gol é coberto por GOAL/SAVE.
      if (playerId && metadata?.noGol === false) {
        contribuicoes.push({
          playerId,
          delta: DELTA_CHUTE_FORA,
          reason: "Chute fora do gol",
        });
      }
      break;

    case "TACKLE":
      if (playerId) {
        contribuicoes.push({ playerId, delta: DELTA_TACKLE, reason: "Desarme" });
      }
      break;

    case "FOUL":
      if (playerId) {
        contribuicoes.push({ playerId, delta: DELTA_FALTA, reason: "Falta" });
      }
      break;

    case "CARD":
      if (playerId && metadata?.cor === "VERMELHO") {
        contribuicoes.push({
          playerId,
          delta: DELTA_CARTAO_VERMELHO,
          reason: "Cartão vermelho",
        });
      } else if (playerId && metadata?.cor === "AMARELO") {
        contribuicoes.push({
          playerId,
          delta: DELTA_CARTAO_AMARELO,
          reason: "Cartão amarelo",
        });
      }
      break;

    case "OFFSIDE":
      if (playerId) {
        contribuicoes.push({
          playerId,
          delta: DELTA_IMPEDIMENTO,
          reason: "Impedimento",
        });
      }
      break;

    default:
      // Neutros: SUBSTITUTION, INJURY, CORNER e demais (§61 não define).
      break;
  }

  return contribuicoes;
}

/**
 * Calcula a nota final de cada jogador na partida (GDD §61).
 *
 * Função pura e determinística: todos começam em {@link RATING_INITIAL},
 * recebem os deltas dos eventos e o resultado é limitado à escala
 * 1.0 – 10.0.
 *
 * @param events eventos da partida (etapa 5).
 * @param playerIds elenco completo opcional — garante nota 6.0 mesmo para
 *   quem não apareceu em nenhum evento (futuro: escalação).
 * @returns mapa de jogador → nota final.
 */
export function computePlayerRatings(
  events: readonly MatchEvent[],
  playerIds: readonly string[] = []
): Record<string, number> {
  const notas = new Map<string, number>();

  for (const id of playerIds) {
    notas.set(id, RATING_INITIAL);
  }

  for (const evento of events) {
    for (const id of [evento.playerId, evento.secondaryPlayerId]) {
      if (id !== undefined && !notas.has(id)) {
        notas.set(id, RATING_INITIAL);
      }
    }
    for (const contribuicao of getRatingContributions(evento)) {
      const atual = notas.get(contribuicao.playerId) ?? RATING_INITIAL;
      notas.set(contribuicao.playerId, atual + contribuicao.delta);
    }
  }

  const resultado: Record<string, number> = {};
  for (const [id, nota] of notas) {
    resultado[id] = clamp(nota);
  }
  return resultado;
}

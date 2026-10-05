/**
 * Estatísticas da partida — etapa 5 do motor.
 *
 * Referências do GDD:
 * - §59: o técnico vê Posse, Finalizações, Finalizações no gol, xG,
 *   Passes, Precisão, Desarmes, Escanteios, Faltas e Cartões.
 * - §60: cada finalização soma xG.
 * - §52: a posse é derivada da linha do tempo dos ciclos (não de eventos).
 *
 * Decisões documentadas (ADR-010):
 * - Estatísticas são calculadas PURAMENTE a partir dos eventos + posse;
 *   função pura, sem estado — fácil de testar e reprocessar (replay §108).
 * - Eventos de clubes fora dos informados são ignorados.
 * - Sem passes, precisão = 0 (evita divisão por zero).
 */
import type { MatchEvent } from "./events.js";

/** Estatísticas de um clube na partida (GDD §59). */
export interface TeamStats {
  /** Posse de bola em % (0–100), derivada da linha do tempo (§59). */
  posse: number;
  finalizacoes: number;
  finalizacoesNoGol: number;
  /** Soma dos xG das finalizações (§60). */
  xg: number;
  passes: number;
  passesCompletos: number;
  /** Precisão de passes em % (passesCompletos / passes × 100). */
  precisao: number;
  desarmes: number;
  escanteios: number;
  faltas: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
}

/** Entrada para o cálculo das estatísticas. */
export interface MatchStatsInput {
  events: readonly MatchEvent[];
  homeClubId: string;
  awayClubId: string;
  /** Segundos de posse do mandante na linha do tempo dos ciclos (§52). */
  homePossessionSeconds?: number;
  /** Segundos de posse do visitante na linha do tempo dos ciclos (§52). */
  awayPossessionSeconds?: number;
}

/** Estatísticas completas da partida, por clube (§59). */
export interface MatchStats {
  home: TeamStats;
  away: TeamStats;
}

function statsVazios(posse: number): TeamStats {
  return {
    posse,
    finalizacoes: 0,
    finalizacoesNoGol: 0,
    xg: 0,
    passes: 0,
    passesCompletos: 0,
    precisao: 0,
    desarmes: 0,
    escanteios: 0,
    faltas: 0,
    cartoesAmarelos: 0,
    cartoesVermelhos: 0,
  };
}

function percentual(parte: number, total: number): number {
  return total > 0 ? (parte / total) * 100 : 0;
}

/**
 * Calcula as estatísticas da partida a partir dos eventos (GDD §59).
 *
 * Função pura e determinística: mesmos eventos → mesmas estatísticas.
 *
 * @param input eventos, clubes e posse (segundos da linha do tempo).
 * @returns estatísticas do mandante e do visitante.
 */
export function computeMatchStats(input: MatchStatsInput): MatchStats {
  const posseHome = input.homePossessionSeconds ?? 0;
  const posseAway = input.awayPossessionSeconds ?? 0;
  const posseTotal = posseHome + posseAway;

  const home = statsVazios(percentual(posseHome, posseTotal));
  const away = statsVazios(percentual(posseAway, posseTotal));

  for (const evento of input.events) {
    const alvo =
      evento.clubId === input.homeClubId
        ? home
        : evento.clubId === input.awayClubId
          ? away
          : null;
    if (alvo === null) continue;

    switch (evento.type) {
      case "PASS":
        alvo.passes += 1;
        if (evento.metadata?.sucesso === true) alvo.passesCompletos += 1;
        break;
      case "SHOT":
        alvo.finalizacoes += 1;
        if (evento.metadata?.noGol === true) alvo.finalizacoesNoGol += 1;
        if (typeof evento.metadata?.xg === "number") alvo.xg += evento.metadata.xg;
        break;
      case "TACKLE":
        alvo.desarmes += 1;
        break;
      case "CORNER":
        alvo.escanteios += 1;
        break;
      case "FOUL":
        alvo.faltas += 1;
        break;
      case "CARD":
        if (evento.metadata?.cor === "VERMELHO") alvo.cartoesVermelhos += 1;
        else if (evento.metadata?.cor === "AMARELO") alvo.cartoesAmarelos += 1;
        break;
      // GOAL/SAVE/SUBSTITUTION/INJURY/OFFSIDE: usados pela narração e
      // replay (§42, §108); placar fica no estado da partida (etapa 2).
      default:
        break;
    }
  }

  home.precisao = percentual(home.passesCompletos, home.passes);
  away.precisao = percentual(away.passesCompletos, away.passes);

  return { home, away };
}

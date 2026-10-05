/**
 * Motor de partidas — estado da partida, ciclo e simulação integrada.
 *
 * Referências do GDD:
 * - §52: cada ciclo interno representa 1 segundo de jogo e atualiza
 *   posição dos jogadores, posição da bola, intenção tática, condição
 *   física, posse e eventos.
 * - §47 (ritmo) e §48 (pressão): ritmo alto e pressão alta aumentam o
 *   desgaste físico.
 * - §104: simulação determinística — a seed da partida reproduz a partida.
 * - §103: o motor recebe times, escalações e táticas.
 *
 * Escopo atual (ver docs/03-ROADMAP.md):
 * - Relógio de 1 ciclo = 1 segundo (§52).
 * - Condição física dos jogadores por ciclo (§52, §16), influenciada por
 *   ritmo e pressão (§47, §48).
 * - Simulação integrada: fases da posse, ações por atributos, gols e
 *   eventos (§53–§55, ADR-012).
 *
 * Fora do escopo (virão depois):
 * - Faltas, cartões, escanteios, impedimentos, substituições (etapa 7).
 * - Campo 2D com jogadores posicionados e movimentação (etapa 7).
 */
import { createRng } from "./rng.js";
import type { Rng } from "./rng.js";
import { MATCH_DURATION_SECONDS } from "./match-state.js";
import type { MatchConfig, MatchState, Pressing, Tempo } from "./match-state.js";
import { simularCiclo } from "./simulation.js";
import type { Elencos } from "./simulation.js";

/**
 * Decaimento da condição (em pontos percentuais) por segundo de jogo.
 *
 * ⚠️ Valores PROVISÓRIOS de equilíbrio — o GDD define que ritmo alto (§47)
 * e pressão alta (§48) aumentam o desgaste, mas não informa constantes.
 * Sujeitos a ajuste via playtest (registrar mudança em
 * docs/REGISTRO-DE-ALTERACOES.md).
 */
const DECAIMENTO_TEMPO_POR_SEGUNDO: Record<Tempo, number> = {
  BAIXO: 0.003,
  NORMAL: 0.004,
  ALTO: 0.006,
};

/** Decaimento adicional da condição por segundo, pela pressão (GDD §48). */
const DECAIMENTO_PRESSING_POR_SEGUNDO: Record<Pressing, number> = {
  BAIXA: 0,
  NORMAL: 0.0005,
  ALTA: 0.001,
};

/** Elencos mínimo por clube: 1 goleiro + 2 jogadores em campo (§53/§55). */
const MINIMO_ELENCO = 3;

/** Instância do motor para uma partida. */
export interface MatchEngine {
  /** RNG da partida (GDD §104) — usado por todas as ações simuladas. */
  readonly rng: Rng;
  /** Estado atual da partida (imutável — cada tick gera um novo objeto). */
  readonly state: MatchState;
  /**
   * Avança um ciclo (1 segundo de jogo): relógio, condição, posse e
   * simulação da jogada (eventos, fase, placar). Retorna o novo estado.
   * Se a partida já terminou, retorna o mesmo estado sem alterações.
   */
  tick(): MatchState;
}

function validarConfiguracao(config: MatchConfig): void {
  if (config.homeClubId === config.awayClubId) {
    throw new Error("Os clubes da casa e visitante devem ser diferentes.");
  }
  if (
    config.homePlayers.length < MINIMO_ELENCO ||
    config.awayPlayers.length < MINIMO_ELENCO
  ) {
    throw new Error(
      `Informe ao menos ${MINIMO_ELENCO} jogadores por clube (1 goleiro + 2 em campo).`
    );
  }
  const todos = [...config.homePlayers, ...config.awayPlayers].map((p) => p.id);
  if (new Set(todos).size !== todos.length) {
    throw new Error(
      "Um mesmo jogador não pode estar escalado duas vezes (nem em dois clubes)."
    );
  }
  const condicaoInicial = config.initialCondition ?? 100;
  if (condicaoInicial < 0 || condicaoInicial > 100) {
    throw new Error(
      `initialCondition deve estar entre 0 e 100. Recebido: ${condicaoInicial}`
    );
  }
}

function criarEstadoInicial(config: MatchConfig): MatchState {
  const condicaoInicial = config.initialCondition ?? 100;
  const conditions: Record<string, number> = {};
  for (const jogador of [...config.homePlayers, ...config.awayPlayers]) {
    conditions[jogador.id] = condicaoInicial;
  }

  return {
    gameSecond: 0,
    status: "EM_ANDAMENTO",
    homeClubId: config.homeClubId,
    awayClubId: config.awayClubId,
    // Posse inicial: manda quem joga em casa (inicio de partida).
    possessionClubId: config.homeClubId,
    // Fase inicial: partir da construção a partir do campo central.
    phase: "CONSTRUCAO",
    // Bola no centro do campo normalizado (0–100).
    ball: { x: 50, y: 50 },
    homeScore: 0,
    awayScore: 0,
    conditions,
    events: [],
    homePossessionSeconds: 0,
    awayPossessionSeconds: 0,
    lastPasserId: null,
  };
}

/**
 * Cria o motor de uma partida a partir da configuração.
 *
 * Determinístico (GDD §104): a mesma configuração gera exatamente a mesma
 * sequência de estados, eventos e placares.
 *
 * @param config times, escalações e táticas iniciais (GDD §103).
 * @returns instância com estado atual e método {@link MatchEngine.tick}.
 */
export function createMatchEngine(config: MatchConfig): MatchEngine {
  validarConfiguracao(config);

  const rng = createRng(config.seed);
  const tempo: Tempo = config.tempo ?? "NORMAL";
  const pressing: Pressing = config.pressing ?? "NORMAL";
  const decaimentoPorSegundo =
    DECAIMENTO_TEMPO_POR_SEGUNDO[tempo] +
    DECAIMENTO_PRESSING_POR_SEGUNDO[pressing];

  const elencos: Elencos = {
    home: config.homePlayers,
    away: config.awayPlayers,
  };

  let state = criarEstadoInicial(config);

  return {
    rng,
    get state(): MatchState {
      return state;
    },
    tick(): MatchState {
      if (state.status === "ENCERRADA") {
        return state;
      }

      const gameSecond = state.gameSecond + 1;
      const status =
        gameSecond >= MATCH_DURATION_SECONDS ? "ENCERRADA" : "EM_ANDAMENTO";

      // §52: cada ciclo atualiza a condição física de todos os jogadores.
      // Decaimento com piso em 0 (GDD §16: escala 0 a 100%).
      const conditions: Record<string, number> = {};
      for (const [id, condicao] of Object.entries(state.conditions)) {
        conditions[id] = Math.max(0, condicao - decaimentoPorSegundo);
      }

      // Linha do tempo de posse (§52) — conta a posse vigente no ciclo.
      const possuindoCasa = state.possessionClubId === state.homeClubId;

      let novo: MatchState = {
        ...state,
        gameSecond,
        status,
        conditions,
        homePossessionSeconds:
          state.homePossessionSeconds + (possuindoCasa ? 1 : 0),
        awayPossessionSeconds:
          state.awayPossessionSeconds + (possuindoCasa ? 0 : 1),
      };

      // §52: o ciclo também atualiza posse, bola e eventos (simulação).
      if (novo.status === "EM_ANDAMENTO") {
        novo = simularCiclo(novo, rng, elencos);
      }

      state = novo;
      return state;
    },
  };
}

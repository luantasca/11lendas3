/**
 * Estado da partida — etapa 2 + integração do ciclo.
 *
 * Referências do GDD:
 * - §52: o motor funciona por ciclos; cada ciclo representa 1 segundo de jogo
 *   e atualiza posição da bola, intenção tática, condição física, posse
 *   e eventos.
 * - §53: a partida passa por estados de posse
 *   (DEFESA, CONSTRUÇÃO, MEIO-CAMPO, ATAQUE, ÚLTIMO TERÇO, CHANCE, FINALIZAÇÃO).
 * - §16: condição física em escala 0 a 100%.
 * - §59/§91: eventos e posse alimentam as estatísticas.
 * - §89: placar e status do jogo.
 *
 * Premissas de implementação (documentadas em docs/REGISTRO-DE-ALTERACOES.md):
 * - Duração de 90 minutos (5400 s): regra padrão de futebol; GDD não define.
 * - Campo 2D normalizado: x e y em 0–100 (§40 não define coordenadas).
 * - Fase inicial CONSTRUCAO; mandante ataca para x crescente.
 */
import type { MatchEvent } from "./events.js";
import type { Player } from "./player.js";

/** Ritmo do jogo (GDD §47). Afeta o desgaste físico por ciclo. */
export type Tempo = "BAIXO" | "NORMAL" | "ALTO";

/** Pressão do time (GDD §48). Pressão alta: mais desgaste (§48). */
export type Pressing = "BAIXA" | "NORMAL" | "ALTA";

/** Status geral da partida (referência: campo status de matches, GDD §89). */
export type MatchStatus = "EM_ANDAMENTO" | "ENCERRADA";

/**
 * Estados de posse da partida (GDD §53).
 * Valores em ASCII sem acentos para uso como chaves de código;
 * os rótulos de exibição em PT-BR ficam na camada de interface.
 */
export type PossessionPhase =
  | "DEFESA"
  | "CONSTRUCAO"
  | "MEIO_CAMPO"
  | "ATAQUE"
  | "ULTIMO_TERCO"
  | "CHANCE"
  | "FINALIZACAO";

/** Posição da bola no campo 2D normalizado (0–100 em x e y). */
export interface BallPosition {
  x: number;
  y: number;
}

/**
 * Estado completo da partida em um instante.
 * Estrutura imutável: cada ciclo gera um novo objeto (ver engine.ts).
 */
export interface MatchState {
  /** Segundo atual do jogo (0 a MATCH_DURATION_SECONDS). */
  gameSecond: number;
  status: MatchStatus;
  homeClubId: string;
  awayClubId: string;
  /** Clube com a posse da bola. */
  possessionClubId: string;
  /** Fase atual da posse (GDD §53). */
  phase: PossessionPhase;
  /** Posição da bola no campo 2D. */
  ball: BallPosition;
  homeScore: number;
  awayScore: number;
  /**
   * Condição física (0–100%, GDD §16) de cada jogador em campo,
   * indexada por id do jogador.
   */
  conditions: Record<string, number>;
  /** Todos os eventos gerados até aqui (GDD §91) — alimenta §59 e §61. */
  events: MatchEvent[];
  /** Segundos de posse acumulados do mandante (linha do tempo, §52/§59). */
  homePossessionSeconds: number;
  /** Segundos de posse acumulados do visitante (linha do tempo, §52/§59). */
  awayPossessionSeconds: number;
  /**
   * Último passe completado na posse atual — usado para atribuir a
   * assistência no gol (GDD §61; contrato ADR-011).
   */
  lastPasserId: string | null;
}

/**
 * Configuração para criar uma partida.
 * O motor recebe times, escalações e táticas (GDD §103) — os elencos são
 * listas de jogadores COM atributos (§10), necessários para resolver as
 * ações dentro do ciclo.
 */
export interface MatchConfig {
  /** Seed da partida para simulação determinística (GDD §104). */
  seed: number;
  homeClubId: string;
  awayClubId: string;
  /** Elenco do clube da casa — mínimo 3 (goleiro + 2 em campo). */
  homePlayers: Player[];
  /** Elenco do visitante — mínimo 3 (goleiro + 2 em campo). */
  awayPlayers: Player[];
  /** Ritmo (GDD §47). Padrão: NORMAL. */
  tempo?: Tempo;
  /** Pressão (GDD §48). Padrão: NORMAL. */
  pressing?: Pressing;
  /** Condição física inicial dos jogadores (GDD §16). Padrão: 100. */
  initialCondition?: number;
}

/**
 * Duração da partida em segundos (90 minutos).
 * Premissa documentada — ver cabeçalho deste arquivo.
 */
export const MATCH_DURATION_SECONDS = 5400;

/**
 * Eventos da partida — etapa 5 do motor.
 *
 * Referências do GDD:
 * - §91: match_events (game_second, type, club_id, player_id,
 *   secondary_player_id, metadata_json) e lista de tipos:
 *   PASS, SHOT, GOAL, SAVE, FOUL, CARD, SUBSTITUTION, INJURY, OFFSIDE.
 * - §52: cada ciclo atualiza eventos.
 * - §42 (narração) e §108 (replay) consumirão estes eventos futuramente.
 *
 * Decisões documentadas (ADR-010):
 * - `id` e `match_id` da §91 NÃO existem aqui: são responsabilidade da
 *   camada de persistência (banco — §84–101).
 * - Tipos TACKLE e CORNER são extensões da lista da §91, necessárias
 *   porque a §59 exige estatísticas de desarmes e escanteios.
 */
import { MATCH_DURATION_SECONDS } from "./match-state.js";

/**
 * Tipos de evento (GDD §91) + extensões documentadas para a §59.
 */
export type MatchEventType =
  | "PASS"
  | "SHOT"
  | "GOAL"
  | "SAVE"
  | "FOUL"
  | "CARD"
  | "SUBSTITUTION"
  | "INJURY"
  | "OFFSIDE"
  | "TACKLE" // extensão: desarmes (§59)
  | "CORNER"; // extensão: escanteios (§59)

/**
 * Metadados do evento (equivalente a metadata_json, GDD §91).
 * Campos conhecidos documentados; demais chaves são livres.
 */
export interface MatchEventMetadata {
  /** Valor xG do chute (GDD §60). */
  xg?: number;
  /** O chute saiu no gol? (finalizações no gol, §59). */
  noGol?: boolean;
  /** O passe foi completado? (precisão, §59). */
  sucesso?: boolean;
  /** Cor do cartão (§59). */
  cor?: "AMARELO" | "VERMELHO";
  /** metadata_json livre (§91). */
  [chave: string]: unknown;
}

/** Evento em memória de uma partida (GDD §91). */
export interface MatchEvent {
  /** Segundo do jogo em que ocorreu (0 a MATCH_DURATION_SECONDS). */
  gameSecond: number;
  type: MatchEventType;
  /** Clube dono da ação (quem executa/sofre o evento). */
  clubId: string;
  /** Jogador principal envolvido (§91). */
  playerId?: string;
  /** Jogador secundário — ex.: passe para, marcador, assistidor (§91). */
  secondaryPlayerId?: string;
  metadata?: MatchEventMetadata;
}

const TIPOS_VALIDOS: ReadonlySet<MatchEventType> = new Set<MatchEventType>([
  "PASS",
  "SHOT",
  "GOAL",
  "SAVE",
  "FOUL",
  "CARD",
  "SUBSTITUTION",
  "INJURY",
  "OFFSIDE",
  "TACKLE",
  "CORNER",
]);

/**
 * Valida e cria um evento de partida.
 *
 * @param entrada dados do evento (GDD §91).
 * @returns cópia validada do evento.
 * @throws erro em PT-BR se o segundo, o tipo ou o clube forem inválidos.
 */
export function criarEvento(entrada: MatchEvent): MatchEvent {
  if (
    !Number.isInteger(entrada.gameSecond) ||
    entrada.gameSecond < 0 ||
    entrada.gameSecond > MATCH_DURATION_SECONDS
  ) {
    throw new Error(
      `gameSecond deve ser inteiro entre 0 e ${MATCH_DURATION_SECONDS}. Recebido: ${entrada.gameSecond}`
    );
  }
  if (!TIPOS_VALIDOS.has(entrada.type)) {
    throw new Error(`Tipo de evento inválido: ${entrada.type}`);
  }
  if (!entrada.clubId) {
    throw new Error("clubId é obrigatório.");
  }
  return { ...entrada };
}

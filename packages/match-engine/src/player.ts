/**
 * Ficha e atributos do jogador — etapa 3 do motor.
 *
 * Referências do GDD:
 * - §10: lista de atributos (Técnicos, Físicos, Mentais, Defensivos,
 *   Goleiros) em escala de 1 a 100.
 * - §85: ficha do jogador (id, nome, pé dominante, posição...).
 * - §86: player_attributes (nomes em inglês usados como referência).
 *
 * Contrato: todo atributo deve estar na faixa 1–100.
 * (Nome em inglês + comentário PT-BR conforme ADR-007.)
 */

/** Pé dominante do jogador (GDD §85 — preferred_foot). */
export type PreferredFoot = "left" | "right";

/**
 * Atributos de um jogador, escala 1–100 (GDD §10).
 * Inclui o grupo de goleiros (§10) — jogadores de linha podem tê-los
 * baixos; a base de dados definirá os valores reais.
 */
export interface PlayerAttributes {
  // --- Técnicos (§10) ---
  finishing: number; // Finalização
  passing: number; // Passe
  crossing: number; // Cruzamento
  dribbling: number; // Drible
  first_touch: number; // Primeiro toque
  heading: number; // Cabeceio
  free_kicks: number; // Bola parada

  // --- Físicos (§10) ---
  speed: number; // Velocidade
  acceleration: number; // Aceleração
  strength: number; // Força
  stamina: number; // Resistência
  agility: number; // Agilidade

  // --- Mentais (§10) ---
  positioning: number; // Posicionamento
  vision: number; // Visão
  decisions: number; // Decisão
  anticipation: number; // Antecipação
  composure: number; // Composição
  teamwork: number; // Trabalho em equipe

  // --- Defensivos (§10) ---
  marking: number; // Marcação
  tackling: number; // Desarme
  interceptions: number; // Interceptação

  // --- Goleiros (§10) ---
  reflexes: number; // Reflexo
  gk_positioning: number; // Posicionamento (goleiro)
  gk_rushing_out: number; // Saída
  gk_aerial: number; // Jogo aéreo
  gk_distribution: number; // Reposição
  gk_one_on_one: number; // Um contra um
}

/**
 * Jogador — etapa 3. Campos adicionais da ficha (§85: birth_date, height,
 * primary_position...) entram quando a base de jogadores for criada.
 */
export interface Player {
  id: string;
  name: string;
  preferredFoot: PreferredFoot;
  attributes: PlayerAttributes;
}

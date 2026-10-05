import type { Player, PlayerAttributes, PreferredFoot } from "../src/player.js";

/**
 * Helpers de testes: jogadores com atributos base 70 (GDD §10),
 * sobrescrevendo o que cada teste precisa.
 *
 * Obs.: ações de teste também têm builders locais (actions.test.ts,
 * controlled-randomness.test.ts) — manter sincronizados se a ficha mudar.
 */

/** Preenche todos os atributos com um valor base, aplicando sobrescritas. */
export function atributosBase(
  sobrescrever: Partial<PlayerAttributes> = {}
): PlayerAttributes {
  const base = 70;
  return {
    finishing: base,
    passing: base,
    crossing: base,
    dribbling: base,
    first_touch: base,
    heading: base,
    free_kicks: base,
    speed: base,
    acceleration: base,
    strength: base,
    stamina: base,
    agility: base,
    positioning: base,
    vision: base,
    decisions: base,
    anticipation: base,
    composure: base,
    teamwork: base,
    marking: base,
    tackling: base,
    interceptions: base,
    reflexes: base,
    gk_positioning: base,
    gk_rushing_out: base,
    gk_aerial: base,
    gk_distribution: base,
    gk_one_on_one: base,
    ...sobrescrever,
  };
}

export function jogador(
  id: string,
  sobrescrever: Partial<PlayerAttributes> = {},
  pe: PreferredFoot = "right"
): Player {
  return {
    id,
    name: id.toUpperCase(),
    preferredFoot: pe,
    attributes: atributosBase(sobrescrever),
  };
}

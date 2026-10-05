import { describe, expect, it } from "vitest";
import {
  calcDribbleChance,
  calcPassChance,
  calcShotChance,
  resolveDribble,
  resolvePass,
  resolveShot,
} from "../src/actions.js";
import type { DribbleContext, PassContext, ShotContext } from "../src/actions.js";
import { createRng } from "../src/rng.js";
import type { Player, PlayerAttributes } from "../src/player.js";

/**
 * Testes da ALEATORIEDADE CONTROLADA (GDD §56):
 * - "Cristiano Ronaldo pode perder um gol."
 * - "Um jogador limitado pode marcar um golaço."
 * - "Mas estatisticamente: o melhor jogador terá desempenho superior
 *   ao longo de muitas partidas."
 *
 * São propriedades estatísticas: verificadas com muitas repetições.
 * Tolerâncias com folga de vários desvios-padrão para não serem
 * frágeis — mas apertadas o bastante para flagrar regressão real.
 */

function atributos(sobrescrever: Partial<PlayerAttributes> = {}): PlayerAttributes {
  const base = 70;
  const completo: PlayerAttributes = {
    finishing: base, passing: base, crossing: base, dribbling: base,
    first_touch: base, heading: base, free_kicks: base,
    speed: base, acceleration: base, strength: base, stamina: base,
    agility: base, positioning: base, vision: base, decisions: base,
    anticipation: base, composure: base, teamwork: base,
    marking: base, tackling: base, interceptions: base,
    reflexes: base, gk_positioning: base, gk_rushing_out: base,
    gk_aerial: base, gk_distribution: base, gk_one_on_one: base,
    ...sobrescrever,
  };
  return completo;
}

function jogador(id: string, overrides: Partial<PlayerAttributes> = {}): Player {
  return { id, name: id, preferredFoot: "right", attributes: atributos(overrides) };
}

function contextoChute(sobrescrever: Partial<ShotContext> = {}): ShotContext {
  return {
    atacante: jogador("finalizador"),
    goleiro: jogador("goleiro", { reflexes: 75, gk_positioning: 75, gk_one_on_one: 75 }),
    usandoPeDominante: true,
    angulo: 0.7,
    distancia: 12,
    pressao: 30,
    ...sobrescrever,
  };
}

const TENTATIVAS = 10_000;

function taxaDeSucesso(sorteio: () => boolean): number {
  let sucessos = 0;
  for (let i = 0; i < TENTATIVAS; i++) {
    if (sorteio()) sucessos++;
  }
  return sucessos / TENTATIVAS;
}

describe("aleatoriedade controlada (§56)", () => {
  it("a frequência empírica respeita a chance declarada (controlada)", () => {
    const ctx = contextoChute();
    const chance = calcShotChance(ctx);
    const rng = createRng(20261005);

    const taxa = taxaDeSucesso(() => resolveShot(ctx, rng).sucesso);

    // ±3 pontos percentuais ≈ 6 desvios-padrão para 10.000 tentativas.
    expect(taxa).toBeGreaterThan(chance - 0.03);
    expect(taxa).toBeLessThan(chance + 0.03);
  });

  it("o jogador melhor vence com frequência claramente superior (§56)", () => {
    const craque = contextoChute({
      atacante: jogador("craque", { finishing: 95, composure: 95, positioning: 95 }),
      goleiro: jogador("gk", { reflexes: 40, gk_positioning: 40, gk_one_on_one: 40 }),
      angulo: 1,
      distancia: 8,
      pressao: 0,
    });
    const limitado = contextoChute({
      atacante: jogador("limitado", { finishing: 25, composure: 25, positioning: 25 }),
      goleiro: jogador("gk", { reflexes: 95, gk_positioning: 95, gk_one_on_one: 95 }),
      usandoPeDominante: false,
      angulo: 0.1,
      distancia: 35,
      pressao: 80,
    });

    const rngCraque = createRng(1);
    const rngLimitado = createRng(2);
    const taxaCraque = taxaDeSucesso(() => resolveShot(craque, rngCraque).sucesso);
    const taxaLimitado = taxaDeSucesso(() => resolveShot(limitado, rngLimitado).sucesso);

    expect(calcShotChance(craque)).toBeGreaterThan(calcShotChance(limitado));
    expect(taxaCraque).toBeGreaterThan(taxaLimitado + 0.3);
  });

  it("'Cristiano Ronaldo pode perder um gol': favorito nunca vence 100%", () => {
    // Chance máxima do chute é 0.80 (clamp) — o craque SEMPRE perde às vezes.
    const chanceMaxima = calcShotChance(contextoChute());
    expect(chanceMaxima).toBeLessThanOrEqual(0.8);

    const craque = contextoChute({
      atacante: jogador("craque", { finishing: 100, composure: 100, positioning: 100 }),
      goleiro: jogador("gk", { reflexes: 1, gk_positioning: 1, gk_one_on_one: 1 }),
      angulo: 1,
      distancia: 3,
      pressao: 0,
    });
    expect(calcShotChance(craque)).toBe(0.8); // clamp ativo

    const rng = createRng(7);
    let erros = 0;
    for (let i = 0; i < TENTATIVAS; i++) {
      if (!resolveShot(craque, rng).sucesso) erros += 1;
    }
    // Esperados ≈ 2.000 erros; exigimos uma fração segura deles.
    expect(erros).toBeGreaterThan(1_500);
  });

  it("'um jogador limitado pode marcar um golaço': azarado nunca zera", () => {
    const limitado = contextoChute({
      atacante: jogador("limitado", { finishing: 1, composure: 1, positioning: 1 }),
      goleiro: jogador("gk", { reflexes: 100, gk_positioning: 100, gk_one_on_one: 100 }),
      usandoPeDominante: false,
      angulo: 0,
      distancia: 50,
      pressao: 100,
    });
    expect(calcShotChance(limitado)).toBe(0.01); // clamp mínimo > 0

    const rng = createRng(99);
    let gols = 0;
    for (let i = 0; i < TENTATIVAS; i++) {
      if (resolveShot(limitado, rng).sucesso) gols += 1;
    }
    // Esperados ≈ 100 gols; exigimos uma fração segura.
    expect(gols).toBeGreaterThan(30);
  });

  it("passe e drible também respeitam a chance declarada", () => {
    const passe: PassContext = {
      atacante: jogador("p", { passing: 85, vision: 85, decisions: 80 }),
      receptor: jogador("r"),
      pressao: 55,
      distancia: 20,
      entrosamento: 65,
    };
    const rngPasse = createRng(11);
    const chancePasse = calcPassChance(passe);
    const taxaPasse = taxaDeSucesso(() =>
      resolvePass(passe, rngPasse).sucesso
    );
    expect(Math.abs(taxaPasse - chancePasse)).toBeLessThan(0.03);

    const drible: DribbleContext = {
      atacante: jogador("a", { dribbling: 80, agility: 80 }),
      marcador: jogador("m", { tackling: 75, positioning: 75, agility: 75 }),
    };
    const rngDrible = createRng(12);
    const chanceDrible = calcDribbleChance(drible);
    const taxaDrible = taxaDeSucesso(() =>
      resolveDribble(drible, rngDrible).sucesso
    );
    expect(Math.abs(taxaDrible - chanceDrible)).toBeLessThan(0.03);
  });

  it("é determinística: mesma seed reproduz 10.000 desfechos idênticos (§104)", () => {
    const ctx = contextoChute();
    const a = createRng(4242);
    const b = createRng(4242);

    for (let i = 0; i < TENTATIVAS; i++) {
      expect(resolveShot(ctx, a).sucesso).toBe(resolveShot(ctx, b).sucesso);
    }
  });
});

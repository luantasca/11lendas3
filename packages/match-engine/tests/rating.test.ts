import { describe, expect, it } from "vitest";
import { criarEvento } from "../src/events.js";
import type { MatchEvent } from "../src/events.js";
import {
  RATING_INITIAL,
  RATING_MAX,
  RATING_MIN,
  computePlayerRatings,
  getRatingContributions,
} from "../src/rating.js";

/**
 * Testes da etapa 6: nota dos jogadores (GDD §61).
 * - Nota inicial 6.0, escala 1.0–10.0.
 * - Ações positivas aumentam; negativas diminuem.
 */

function evento(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return criarEvento({
    gameSecond: 100,
    type: "PASS",
    clubId: "casa",
    playerId: "j1",
    ...overrides,
  });
}

describe("constantes da escala (§61)", () => {
  it("usa exatamente os valores do GDD §61", () => {
    expect(RATING_INITIAL).toBe(6.0);
    expect(RATING_MIN).toBe(1.0);
    expect(RATING_MAX).toBe(10.0);
  });
});

describe("getRatingContributions — contribuições por ação (§61)", () => {
  it("GOL aumenta a nota do marcador e do assistidor", () => {
    const contrib = getRatingContributions(
      evento({ type: "GOAL", playerId: "atacante", secondaryPlayerId: "meia" })
    );
    expect(contrib).toHaveLength(2);
    expect(contrib[0]).toMatchObject({ playerId: "atacante", delta: 0.4, reason: "Gol" });
    expect(contrib[1]).toMatchObject({ playerId: "meia", delta: 0.2, reason: "Assistência" });
  });

  it("SAVE aumenta o goleiro e diminui o finalizador", () => {
    const contrib = getRatingContributions(
      evento({ type: "SAVE", playerId: "gk", secondaryPlayerId: "chutador" })
    );
    expect(contrib[0]).toMatchObject({ playerId: "gk", delta: 0.015 });
    expect(contrib[1]).toMatchObject({ playerId: "chutador", delta: -0.004 });
    expect(contrib[0]!.delta).toBeGreaterThan(0);
    expect(contrib[1]!.delta).toBeLessThan(0);
  });

  it("passe completo aumenta e passe falho diminui", () => {
    const completo = getRatingContributions(
      evento({ type: "PASS", metadata: { sucesso: true } })
    );
    const falho = getRatingContributions(
      evento({ type: "PASS", metadata: { sucesso: false } })
    );
    expect(completo[0]!.delta).toBeGreaterThan(0);
    expect(falho[0]!.delta).toBeLessThan(0);
  });

  it("chute fora do gol diminui; chute no gol é coberto por GOAL/SAVE", () => {
    const fora = getRatingContributions(
      evento({ type: "SHOT", metadata: { noGol: false, xg: 0.1 } })
    );
    const noGol = getRatingContributions(
      evento({ type: "SHOT", metadata: { noGol: true, xg: 0.4 } })
    );
    expect(fora[0]!.delta).toBeLessThan(0);
    expect(noGol).toHaveLength(0);
  });

  it("cartão vermelho penaliza mais que o amarelo", () => {
    const amarelo = getRatingContributions(
      evento({ type: "CARD", metadata: { cor: "AMARELO" } })
    );
    const vermelho = getRatingContributions(
      evento({ type: "CARD", metadata: { cor: "VERMELHO" } })
    );
    expect(vermelho[0]!.delta).toBeLessThan(amarelo[0]!.delta);
    expect(amarelo[0]!.delta).toBeLessThan(0);
  });

  it("falta, impedimento e desarme têm efeito esperado", () => {
    expect(getRatingContributions(evento({ type: "FOUL" }))[0]!.delta).toBeLessThan(0);
    expect(getRatingContributions(evento({ type: "OFFSIDE" }))[0]!.delta).toBeLessThan(0);
    expect(getRatingContributions(evento({ type: "TACKLE" }))[0]!.delta).toBeGreaterThan(0);
  });

  it("eventos neutros não alteram nota (INJURY, CORNER, SUBSTITUTION)", () => {
    expect(getRatingContributions(evento({ type: "INJURY" }))).toHaveLength(0);
    expect(getRatingContributions(evento({ type: "CORNER" }))).toHaveLength(0);
    expect(getRatingContributions(evento({ type: "SUBSTITUTION" }))).toHaveLength(0);
  });
});

describe("computePlayerRatings — nota final (§61)", () => {
  it("jogador sem ações relevantes mantém a nota inicial 6.0", () => {
    const notas = computePlayerRatings([
      evento({ type: "INJURY", playerId: "j9" }),
    ]);
    expect(notas["j9"]).toBe(RATING_INITIAL);
  });

  it("elenco informado recebe 6.0 mesmo sem eventos", () => {
    const notas = computePlayerRatings([], ["a", "b", "c"]);
    expect(notas).toEqual({ a: 6, b: 6, c: 6 });
  });

  it("soma as ações positivas e negativas do jogador", () => {
    // j1: um gol (+0.4) e uma falta (-0.02) => 6.38
    const notas = computePlayerRatings([
      evento({ type: "GOAL", playerId: "j1" }),
      evento({ type: "FOUL", playerId: "j1" }),
    ]);
    expect(notas["j1"]).toBeCloseTo(6.38, 10);
  });

  it("respeita o piso da escala (nunca abaixo de 1.0)", () => {
    const eventos: MatchEvent[] = [];
    for (let i = 0; i < 100; i++) {
      eventos.push(evento({ type: "CARD", playerId: "j1", metadata: { cor: "VERMELHO" } }));
    }
    const notas = computePlayerRatings(eventos);
    expect(notas["j1"]).toBe(RATING_MIN);
    expect(notas["j1"]).toBeGreaterThanOrEqual(1.0);
  });

  it("respeita o teto da escala (nunca acima de 10.0)", () => {
    const eventos: MatchEvent[] = [];
    for (let i = 0; i < 100; i++) {
      eventos.push(evento({ type: "GOAL", playerId: "j1" }));
    }
    const notas = computePlayerRatings(eventos);
    expect(notas["j1"]).toBe(RATING_MAX);
    expect(notas["j1"]).toBeLessThanOrEqual(10.0);
  });

  it("é determinística: mesmos eventos → mesmas notas", () => {
    const eventos = [
      evento({ type: "GOAL", playerId: "j1", secondaryPlayerId: "j2" }),
      evento({ type: "SAVE", playerId: "gk1", secondaryPlayerId: "j3" }),
      evento({ type: "CARD", playerId: "j4", metadata: { cor: "AMARELO" } }),
      evento({ type: "PASS", playerId: "j1", metadata: { sucesso: true } }),
    ];
    expect(computePlayerRatings(eventos)).toEqual(computePlayerRatings(eventos));
  });

  it("todos os jogadores citados aparecem no resultado", () => {
    const notas = computePlayerRatings([
      evento({ type: "GOAL", playerId: "atacante", secondaryPlayerId: "meia" }),
      evento({ type: "SAVE", playerId: "gk", secondaryPlayerId: "zagueiro" }),
    ]);
    expect(Object.keys(notas).sort()).toEqual([
      "atacante", "gk", "meia", "zagueiro",
    ]);
  });
});

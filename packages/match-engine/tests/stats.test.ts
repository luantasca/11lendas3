import { describe, expect, it } from "vitest";
import { criarEvento } from "../src/events.js";
import type { MatchEvent, MatchEventType } from "../src/events.js";
import { calcularXg } from "../src/xg.js";
import { computeMatchStats } from "../src/stats.js";
import { MATCH_DURATION_SECONDS } from "../src/match-state.js";

/**
 * Testes da etapa 5: eventos (§91), xG (§60) e estatísticas (§59).
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

describe("criarEvento (§91)", () => {
  it("cria um evento válido", () => {
    const ev = evento({ type: "SHOT", metadata: { xg: 0.42, noGol: true } });
    expect(ev.type).toBe("SHOT");
    expect(ev.metadata?.xg).toBe(0.42);
  });

  it("aceita todos os tipos do GDD §91", () => {
    const tiposGdd: MatchEventType[] = [
      "PASS", "SHOT", "GOAL", "SAVE", "FOUL", "CARD",
      "SUBSTITUTION", "INJURY", "OFFSIDE",
    ];
    for (const type of tiposGdd) {
      expect(() => evento({ type })).not.toThrow();
    }
  });

  it("rejeita segundo fora da partida", () => {
    expect(() => evento({ gameSecond: -1 })).toThrow(/gameSecond/);
    expect(() => evento({ gameSecond: MATCH_DURATION_SECONDS + 1 })).toThrow(/gameSecond/);
    expect(() => evento({ gameSecond: 1.5 })).toThrow(/gameSecond/);
  });

  it("rejeita tipo inválido e clube vazio", () => {
    expect(() =>
      evento({ type: "XYZ" as MatchEventType })
    ).toThrow(/Tipo de evento inválido/);
    expect(() => evento({ clubId: "" })).toThrow(/clubId/);
  });
});

describe("calcularXg (§60)", () => {
  it("reproduz exatamente a tabela do GDD §60", () => {
    expect(calcularXg("FORA_DA_AREA")).toBe(0.05);
    expect(calcularXg("CABECADA")).toBe(0.12);
    expect(calcularXg("CARA_A_CARA")).toBe(0.42);
    expect(calcularXg("PENALTI")).toBe(0.76);
  });
});

describe("computeMatchStats (§59)", () => {
  const eventos: MatchEvent[] = [
    evento({ type: "PASS", metadata: { sucesso: true } }),
    evento({ type: "PASS", metadata: { sucesso: true } }),
    evento({ type: "PASS", metadata: { sucesso: false } }),
    evento({ type: "PASS", clubId: "fora", metadata: { sucesso: true } }),
    evento({ type: "SHOT", metadata: { xg: 0.42, noGol: true } }),
    evento({ type: "SHOT", metadata: { xg: 0.05, noGol: false } }),
    evento({ type: "SHOT", clubId: "fora", metadata: { xg: 0.76, noGol: true } }),
    evento({ type: "TACKLE" }),
    evento({ type: "TACKLE" }),
    evento({ type: "CORNER" }),
    evento({ type: "FOUL", clubId: "fora" }),
    evento({ type: "CARD", metadata: { cor: "AMARELO" } }),
    evento({ type: "CARD", clubId: "fora", metadata: { cor: "VERMELHO" } }),
    evento({ type: "GOAL" }), // não afeta estatísticas da §59
    evento({ type: "SAVE" }),
    evento({ clubId: "terceiro" }), // clube desconhecido é ignorado
  ];

  it("calcula as estatísticas do mandante (§59)", () => {
    const { home } = computeMatchStats({
      events: eventos,
      homeClubId: "casa",
      awayClubId: "fora",
    });

    expect(home.passes).toBe(3);
    expect(home.passesCompletos).toBe(2);
    expect(home.precisao).toBeCloseTo((2 / 3) * 100, 5);
    expect(home.finalizacoes).toBe(2);
    expect(home.finalizacoesNoGol).toBe(1);
    expect(home.xg).toBeCloseTo(0.47, 5);
    expect(home.desarmes).toBe(2);
    expect(home.escanteios).toBe(1);
    expect(home.faltas).toBe(0);
    expect(home.cartoesAmarelos).toBe(1);
    expect(home.cartoesVermelhos).toBe(0);
  });

  it("calcula as estatísticas do visitante (§59)", () => {
    const { away } = computeMatchStats({
      events: eventos,
      homeClubId: "casa",
      awayClubId: "fora",
    });

    expect(away.passes).toBe(1);
    expect(away.precisao).toBe(100);
    expect(away.finalizacoes).toBe(1);
    expect(away.finalizacoesNoGol).toBe(1);
    expect(away.xg).toBeCloseTo(0.76, 5);
    expect(away.desarmes).toBe(0);
    expect(away.faltas).toBe(1);
    expect(away.cartoesAmarelos).toBe(0);
    expect(away.cartoesVermelhos).toBe(1);
  });

  it("calcula a posse a partir da linha do tempo dos ciclos (§52, §59)", () => {
    const stats = computeMatchStats({
      events: [],
      homeClubId: "casa",
      awayClubId: "fora",
      homePossessionSeconds: 2700,
      awayPossessionSeconds: 1800,
    });

    expect(stats.home.posse).toBeCloseTo(60, 5);
    expect(stats.away.posse).toBeCloseTo(40, 5);
    expect(stats.home.posse + stats.away.posse).toBeCloseTo(100, 5);
  });

  it("sem dados de posse, posse = 0 (sem inventar informação)", () => {
    const stats = computeMatchStats({
      events: [],
      homeClubId: "casa",
      awayClubId: "fora",
    });
    expect(stats.home.posse).toBe(0);
    expect(stats.away.posse).toBe(0);
  });

  it("sem passes, precisão = 0 (evita divisão por zero)", () => {
    const stats = computeMatchStats({
      events: [evento({ type: "SHOT", metadata: { xg: 0.05 } })],
      homeClubId: "casa",
      awayClubId: "fora",
    });
    expect(stats.home.precisao).toBe(0);
    expect(stats.home.finalizacoes).toBe(1);
    expect(stats.home.xg).toBeCloseTo(0.05, 5);
  });

  it("é determinística: mesmos eventos → mesmas estatísticas", () => {
    const entrada = {
      events: eventos,
      homeClubId: "casa",
      awayClubId: "fora",
      homePossessionSeconds: 100,
      awayPossessionSeconds: 50,
    };
    expect(computeMatchStats(entrada)).toEqual(computeMatchStats(entrada));
  });
});

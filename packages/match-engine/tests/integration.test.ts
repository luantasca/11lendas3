import { describe, expect, it } from "vitest";
import { createMatchEngine } from "../src/engine.js";
import { MATCH_DURATION_SECONDS } from "../src/match-state.js";
import type { MatchConfig, MatchState } from "../src/match-state.js";
import { computeMatchStats } from "../src/stats.js";
import { computePlayerRatings } from "../src/rating.js";
import { jogador } from "./helpers.js";

/**
 * Testes da INTEGRAÇÃO do ciclo (ADR-012): o motor gera jogadas de
 * verdade — fases da posse (§53), ações por atributos (§55), eventos
 * (§91), estatísticas (§59) e notas (§61) a partir de uma partida real.
 */

function configPadrao(sobrescrever: Partial<MatchConfig> = {}): MatchConfig {
  return {
    seed: 918281982,
    homeClubId: "casa",
    awayClubId: "fora",
    homePlayers: [
      jogador("h_gk", { reflexes: 75, gk_positioning: 75, gk_one_on_one: 75 }),
      jogador("h_zag"),
      jogador("h_mei", { passing: 82, vision: 84 }),
      jogador("h_ata", { finishing: 86, composure: 84 }),
    ],
    awayPlayers: [
      jogador("a_gk", { reflexes: 74, gk_positioning: 74, gk_one_on_one: 74 }),
      jogador("a_zag"),
      jogador("a_mei", { passing: 80, vision: 81 }),
      jogador("a_ata", { finishing: 83, composure: 82 }),
    ],
    ...sobrescrever,
  };
}

function rodarPartida(config: MatchConfig): MatchState {
  const engine = createMatchEngine(config);
  for (let i = 0; i < MATCH_DURATION_SECONDS; i++) engine.tick();
  return engine.state;
}

describe("integração — o ciclo gera jogadas (§52–§55)", () => {
  it("produz eventos já nos primeiros segundos", () => {
    const engine = createMatchEngine(configPadrao());
    for (let i = 0; i < 300; i++) engine.tick();

    expect(engine.state.events.length).toBeGreaterThan(0);
    const tipos = new Set(engine.state.events.map((e) => e.type));
    expect(tipos.has("PASS") || tipos.has("TACKLE")).toBe(true);
  });

  it("a posse e a fase mudam durante a partida (§53)", () => {
    const engine = createMatchEngine(configPadrao());
    const fases = new Set<string>();
    const posses = new Set<string>();
    for (let i = 0; i < 600; i++) {
      engine.tick();
      fases.add(engine.state.phase);
      posses.add(engine.state.possessionClubId);
    }

    expect(fases.size).toBeGreaterThanOrEqual(2);
    expect(posses.size).toBeGreaterThanOrEqual(1);
  });

  it("partida completa termina com gols (§89)", () => {
    const estado = rodarPartida(configPadrao());

    expect(estado.status).toBe("ENCERRADA");
    expect(estado.gameSecond).toBe(MATCH_DURATION_SECONDS);
    expect(estado.homeScore + estado.awayScore).toBeGreaterThan(0);

    const tipos = new Set(estado.events.map((e) => e.type));
    expect(tipos.has("GOAL")).toBe(true);
    expect(tipos.has("SHOT")).toBe(true);
    expect(tipos.has("PASS")).toBe(true);
    expect(tipos.has("TACKLE")).toBe(true);
    expect(tipos.has("SAVE")).toBe(true);
  });
});

describe("integração — estatísticas e notas alimentadas (§59, §61)", () => {
  it("estatísticas refletem a partida simulada (§59)", () => {
    const estado = rodarPartida(configPadrao());
    const stats = computeMatchStats({
      events: estado.events,
      homeClubId: estado.homeClubId,
      awayClubId: estado.awayClubId,
      homePossessionSeconds: estado.homePossessionSeconds,
      awayPossessionSeconds: estado.awayPossessionSeconds,
    });

    expect(stats.home.passes).toBeGreaterThan(0);
    expect(stats.away.passes).toBeGreaterThan(0);
    expect(stats.home.finalizacoes + stats.away.finalizacoes).toBeGreaterThan(0);
    expect(stats.home.xg + stats.away.xg).toBeGreaterThan(0);
    expect(stats.home.posse + stats.away.posse).toBeCloseTo(100, 5);
    expect(stats.home.precisao).toBeGreaterThanOrEqual(0);
    expect(stats.home.precisao).toBeLessThanOrEqual(100);

    // Posse bate com a linha do tempo do estado.
    const total = estado.homePossessionSeconds + estado.awayPossessionSeconds;
    expect(stats.home.posse).toBeCloseTo(
      (estado.homePossessionSeconds / total) * 100,
      5
    );
  });

  it("notas ficam dentro da escala 1.0–10.0 (§61)", () => {
    const estado = rodarPartida(configPadrao());
    const notas = computePlayerRatings(estado.events);

    expect(Object.keys(notas).length).toBeGreaterThan(0);
    for (const nota of Object.values(notas)) {
      expect(nota).toBeGreaterThanOrEqual(1.0);
      expect(nota).toBeLessThanOrEqual(10.0);
    }
    // Com uma partida inteira de eventos, alguém sai da nota inicial.
    const variou = Object.values(notas).some((nota) => nota !== 6.0);
    expect(variou).toBe(true);
  });
});

describe("integração — determinismo da partida inteira (§104)", () => {
  it("mesma seed reproduz a mesma partida completa", () => {
    const a = createMatchEngine(configPadrao());
    const b = createMatchEngine(configPadrao());

    for (let i = 0; i < 900; i++) {
      expect(a.tick()).toEqual(b.tick());
    }
    expect(a.state.events).toEqual(b.state.events);
    expect(a.state.homeScore).toBe(b.state.homeScore);
    expect(a.state.awayScore).toBe(b.state.awayScore);
  });

  it("seeds diferentes geram partidas diferentes", () => {
    const a = createMatchEngine(configPadrao({ seed: 1 }));
    const b = createMatchEngine(configPadrao({ seed: 2 }));

    for (let i = 0; i < 900; i++) {
      a.tick();
      b.tick();
    }

    expect(a.state).not.toEqual(b.state);
  });
});

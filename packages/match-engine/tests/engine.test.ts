import { describe, expect, it } from "vitest";
import { createMatchEngine } from "../src/engine.js";
import { MATCH_DURATION_SECONDS } from "../src/match-state.js";
import type { MatchConfig } from "../src/match-state.js";

/** Configuração padrão de teste: 2 jogadores por clube. */
function configPadrao(sobrescrever: Partial<MatchConfig> = {}): MatchConfig {
  return {
    seed: 918281982,
    homeClubId: "casa",
    awayClubId: "fora",
    homePlayerIds: ["j1", "j2"],
    awayPlayerIds: ["j3", "j4"],
    ...sobrescrever,
  };
}

describe("createMatchEngine — estado inicial", () => {
  it("cria a partida no estado esperado", () => {
    const engine = createMatchEngine(configPadrao());
    const estado = engine.state;

    expect(estado.gameSecond).toBe(0);
    expect(estado.status).toBe("EM_ANDAMENTO");
    expect(estado.homeScore).toBe(0);
    expect(estado.awayScore).toBe(0);
    expect(estado.possessionClubId).toBe("casa");
    expect(estado.phase).toBe("CONSTRUCAO");
    expect(estado.ball).toEqual({ x: 50, y: 50 });
    expect(estado.conditions).toEqual({ j1: 100, j2: 100, j3: 100, j4: 100 });
  });

  it("aceita condição inicial personalizada", () => {
    const engine = createMatchEngine(configPadrao({ initialCondition: 92 }));
    expect(Object.values(engine.state.conditions)).toEqual([92, 92, 92, 92]);
  });

  it("expõe a RNG com a seed informada (GDD §104)", () => {
    const engine = createMatchEngine(configPadrao({ seed: 42 }));
    expect(engine.rng.seed).toBe(42);
  });
});

describe("validação da configuração", () => {
  it("rejeita clubes iguais", () => {
    expect(() =>
      createMatchEngine(configPadrao({ awayClubId: "casa" }))
    ).toThrow(/diferentes/);
  });

  it("rejeita clube sem jogadores escalados", () => {
    expect(() =>
      createMatchEngine(configPadrao({ awayPlayerIds: [] }))
    ).toThrow(/ao menos um jogador/);
  });

  it("rejeita jogador repetido na escalação", () => {
    expect(() =>
      createMatchEngine(configPadrao({ awayPlayerIds: ["j1", "j3"] }))
    ).toThrow(/duas vezes/);
  });

  it("rejeita condição inicial fora de 0–100", () => {
    expect(() =>
      createMatchEngine(configPadrao({ initialCondition: 101 }))
    ).toThrow(/entre 0 e 100/);
    expect(() =>
      createMatchEngine(configPadrao({ initialCondition: -1 }))
    ).toThrow(/entre 0 e 100/);
  });

  it("rejeita seed que não seja inteira", () => {
    expect(() => createMatchEngine(configPadrao({ seed: 1.5 }))).toThrow();
  });
});

describe("tick — ciclo de 1 segundo (GDD §52)", () => {
  it("cada ciclo avança exatamente 1 segundo", () => {
    const engine = createMatchEngine(configPadrao());
    for (let i = 0; i < 60; i++) engine.tick();
    expect(engine.state.gameSecond).toBe(60);
  });

  it("não altera o estado anterior (imutabilidade)", () => {
    const engine = createMatchEngine(configPadrao());
    const antes = engine.state;
    engine.tick();

    expect(antes.gameSecond).toBe(0);
    expect(engine.state).not.toBe(antes);
    expect(engine.state.gameSecond).toBe(1);
  });

  it("encerra a partida em 90 minutos e não avança mais", () => {
    const engine = createMatchEngine(configPadrao());
    for (let i = 0; i < MATCH_DURATION_SECONDS + 10; i++) engine.tick();

    expect(engine.state.gameSecond).toBe(MATCH_DURATION_SECONDS);
    expect(engine.state.status).toBe("ENCERRADA");

    const noFinal = engine.tick();
    expect(noFinal.gameSecond).toBe(MATCH_DURATION_SECONDS);
    expect(noFinal.status).toBe("ENCERRADA");
  });
});

describe("condição física por ciclo (GDD §16, §47, §48)", () => {
  it("degrada a condição de todos os jogadores a cada ciclo", () => {
    const engine = createMatchEngine(configPadrao());
    for (let i = 0; i < 600; i++) engine.tick();

    for (const condicao of Object.values(engine.state.conditions)) {
      expect(condicao).toBeLessThan(100);
      expect(condicao).toBeGreaterThan(0);
    }
  });

  it("ritmo alto desgasta mais que ritmo normal (§47)", () => {
    const normal = createMatchEngine(configPadrao({ tempo: "NORMAL" }));
    const alto = createMatchEngine(configPadrao({ tempo: "ALTO" }));
    for (let i = 0; i < 900; i++) {
      normal.tick();
      alto.tick();
    }

    expect(alto.state.conditions["j1"]).toBeLessThan(
      normal.state.conditions["j1"] ?? 100
    );
  });

  it("pressão alta desgasta mais que pressão baixa (§48)", () => {
    const baixa = createMatchEngine(configPadrao({ pressing: "BAIXA" }));
    const alta = createMatchEngine(configPadrao({ pressing: "ALTA" }));
    for (let i = 0; i < 900; i++) {
      baixa.tick();
      alta.tick();
    }

    expect(alta.state.conditions["j1"]).toBeLessThan(
      baixa.state.conditions["j1"] ?? 100
    );
  });

  it("nunca deixa a condição ficar negativa (piso em 0)", () => {
    const engine = createMatchEngine(
      configPadrao({
        initialCondition: 1,
        tempo: "ALTO",
        pressing: "ALTA",
      })
    );
    for (let i = 0; i < 400; i++) engine.tick();

    expect(engine.state.conditions["j1"]).toBe(0);

    // Permanece em 0 até o fim, sem valores negativos.
    for (let i = 0; i < 5200; i++) engine.tick();
    for (const condicao of Object.values(engine.state.conditions)) {
      expect(condicao).toBe(0);
    }
  });
});

describe("determinismo (GDD §104)", () => {
  it("a mesma configuração gera a mesma sequência de estados", () => {
    const a = createMatchEngine(configPadrao());
    const b = createMatchEngine(configPadrao());

    for (let i = 0; i < 100; i++) {
      expect(a.tick()).toEqual(b.tick());
    }
    expect(a.state).toEqual(b.state);
  });

  it("ritmos diferentes geram estados diferentes após alguns ciclos", () => {
    const normal = createMatchEngine(configPadrao({ tempo: "NORMAL" }));
    const baixo = createMatchEngine(configPadrao({ tempo: "BAIXO" }));

    for (let i = 0; i < 50; i++) {
      normal.tick();
      baixo.tick();
    }

    expect(normal.state).not.toEqual(baixo.state);
  });
});

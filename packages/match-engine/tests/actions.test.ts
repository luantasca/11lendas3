import { describe, expect, it } from "vitest";
import {
  calcDribbleChance,
  calcPassChance,
  calcShotChance,
  resolveDribble,
  resolvePass,
  resolveShot,
} from "../src/actions.js";
import type {
  DribbleContext,
  PassContext,
  ShotContext,
} from "../src/actions.js";
import { createRng } from "../src/rng.js";
import type { Player, PlayerAttributes, PreferredFoot } from "../src/player.js";

/** Preenche todos os atributos com um valor base, aplicando sobrescritas. */
function atributosBase(
  sobrescrever: Partial<PlayerAttributes> = {}
): PlayerAttributes {
  return {
    finishing: 70,
    passing: 70,
    crossing: 70,
    dribbling: 70,
    first_touch: 70,
    heading: 70,
    free_kicks: 70,
    speed: 70,
    acceleration: 70,
    strength: 70,
    stamina: 70,
    agility: 70,
    positioning: 70,
    vision: 70,
    decisions: 70,
    anticipation: 70,
    composure: 70,
    teamwork: 70,
    marking: 70,
    tackling: 70,
    interceptions: 70,
    reflexes: 70,
    gk_positioning: 70,
    gk_rushing_out: 70,
    gk_aerial: 70,
    gk_distribution: 70,
    gk_one_on_one: 70,
    ...sobrescrever,
  };
}

function jogador(
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

function contextoPasse(sobrescrever: Partial<PassContext> = {}): PassContext {
  return {
    atacante: jogador("passe"),
    receptor: jogador("receptor"),
    pressao: 40,
    distancia: 15,
    entrosamento: 50,
    ...sobrescrever,
  };
}

function contextoDrible(
  sobrescrever: Partial<DribbleContext> = {}
): DribbleContext {
  return {
    atacante: jogador("atacante"),
    marcador: jogador("marcador"),
    ...sobrescrever,
  };
}

function contextoChute(sobrescrever: Partial<ShotContext> = {}): ShotContext {
  return {
    atacante: jogador("finalizador"),
    goleiro: jogador("goleiro", {
      reflexes: 75,
      gk_positioning: 75,
      gk_one_on_one: 75,
    }),
    usandoPeDominante: true,
    angulo: 0.7,
    distancia: 12,
    pressao: 30,
    ...sobrescrever,
  };
}

// ---------------------------------------------------------------------------
// Passe (GDD §55)
// ---------------------------------------------------------------------------

describe("calcPassChance — passe (§55)", () => {
  it("é determinístico: mesmos dados, mesma chance", () => {
    const ctx = contextoPasse();
    expect(calcPassChance(ctx)).toBe(calcPassChance(ctx));
  });

  it("passeiro melhor gera chance maior", () => {
    const fraco = calcPassChance(
      contextoPasse({ atacante: jogador("a", { passing: 40, vision: 40, decisions: 40 }) })
    );
    const forte = calcPassChance(
      contextoPasse({ atacante: jogador("a", { passing: 90, vision: 90, decisions: 90 }) })
    );
    expect(forte).toBeGreaterThan(fraco);
  });

  it("mais pressão adversária reduz a chance (§55)", () => {
    const tranquila = calcPassChance(contextoPasse({ pressao: 10 }));
    const intensa = calcPassChance(contextoPasse({ pressao: 80 }));
    expect(intensa).toBeLessThan(tranquila);
  });

  it("distância maior reduz a chance (§55)", () => {
    const perto = calcPassChance(contextoPasse({ distancia: 5 }));
    const longe = calcPassChance(contextoPasse({ distancia: 40 }));
    expect(longe).toBeLessThan(perto);
  });

  it("entrosamento maior aumenta a chance (§17, §55)", () => {
    const zero = calcPassChance(contextoPasse({ entrosamento: 0 }));
    const total = calcPassChance(contextoPasse({ entrosamento: 100 }));
    expect(total).toBeGreaterThan(zero);
  });

  it("condição baixa reduz a chance (§16)", () => {
    const apto = calcPassChance(contextoPasse({ condicao: 100 }));
    const cansado = calcPassChance(contextoPasse({ condicao: 60 }));
    expect(cansado).toBeLessThan(apto);
  });

  it("forma positiva aumenta e negativa reduz a chance (§15)", () => {
    const emRitmo = calcPassChance(contextoPasse({ forma: 8 }));
    const normal = calcPassChance(contextoPasse({ forma: 0 }));
    const emQueda = calcPassChance(contextoPasse({ forma: -8 }));
    expect(emRitmo).toBeGreaterThan(normal);
    expect(emQueda).toBeLessThan(normal);
  });

  it("posicionamento do receptor influencia (§55)", () => {
    const ruim = calcPassChance(
      contextoPasse({ receptor: jogador("r", { positioning: 20 }) })
    );
    const bom = calcPassChance(
      contextoPasse({ receptor: jogador("r", { positioning: 95 }) })
    );
    expect(bom).toBeGreaterThan(ruim);
  });

  it("mantém a chance dentro da faixa de sanidade", () => {
    const pessimo = calcPassChance(
      contextoPasse({
        atacante: jogador("a", { passing: 1, vision: 1, decisions: 1 }),
        receptor: jogador("r", { positioning: 1 }),
        pressao: 100,
        distancia: 60,
        entrosamento: 0,
        condicao: 0,
        forma: -10,
      })
    );
    const perfeito = calcPassChance(
      contextoPasse({
        atacante: jogador("a", { passing: 100, vision: 100, decisions: 100 }),
        receptor: jogador("r", { positioning: 100 }),
        pressao: 0,
        distancia: 0,
        entrosamento: 100,
        condicao: 100,
        forma: 10,
      })
    );
    expect(pessimo).toBeGreaterThanOrEqual(0.05);
    expect(perfeito).toBeLessThanOrEqual(0.95);
  });
});

// ---------------------------------------------------------------------------
// Drible (GDD §55)
// ---------------------------------------------------------------------------

describe("calcDribbleChance — drible (§55)", () => {
  it("driblador melhor gera chance maior", () => {
    const fraco = calcDribbleChance(
      contextoDrible({
        atacante: jogador("a", { dribbling: 30, agility: 30, acceleration: 30, decisions: 30 }),
      })
    );
    const forte = calcDribbleChance(
      contextoDrible({
        atacante: jogador("a", { dribbling: 95, agility: 95, acceleration: 95, decisions: 95 }),
      })
    );
    expect(forte).toBeGreaterThan(fraco);
  });

  it("marcador melhor reduz a chance (§55)", () => {
    const fraco = calcDribbleChance(
      contextoDrible({
        marcador: jogador("m", { tackling: 30, positioning: 30, agility: 30 }),
      })
    );
    const forte = calcDribbleChance(
      contextoDrible({
        marcador: jogador("m", { tackling: 95, positioning: 95, agility: 95 }),
      })
    );
    expect(forte).toBeLessThan(fraco);
  });

  it("mantém a chance dentro da faixa de sanidade", () => {
    const pessimo = calcDribbleChance(
      contextoDrible({
        atacante: jogador("a", { dribbling: 1, agility: 1, acceleration: 1, decisions: 1 }),
        marcador: jogador("m", { tackling: 100, positioning: 100, agility: 100 }),
        condicao: 0,
        forma: -10,
      })
    );
    const perfeito = calcDribbleChance(
      contextoDrible({
        atacante: jogador("a", { dribbling: 100, agility: 100, acceleration: 100, decisions: 100 }),
        marcador: jogador("m", { tackling: 1, positioning: 1, agility: 1 }),
        condicao: 100,
        forma: 10,
      })
    );
    expect(pessimo).toBeGreaterThanOrEqual(0.05);
    expect(perfeito).toBeLessThanOrEqual(0.95);
  });
});

// ---------------------------------------------------------------------------
// Finalização (GDD §55)
// ---------------------------------------------------------------------------

describe("calcShotChance — finalização (§55)", () => {
  it("finalizador melhor gera chance maior", () => {
    const fraco = calcShotChance(
      contextoChute({
        atacante: jogador("a", { finishing: 30, composure: 30, positioning: 30 }),
      })
    );
    const forte = calcShotChance(
      contextoChute({
        atacante: jogador("a", { finishing: 95, composure: 95, positioning: 95 }),
      })
    );
    expect(forte).toBeGreaterThan(fraco);
  });

  it("goleiro melhor reduz a chance (§55)", () => {
    const fraco = calcShotChance(
      contextoChute({
        goleiro: jogador("g", { reflexes: 30, gk_positioning: 30, gk_one_on_one: 30 }),
      })
    );
    const forte = calcShotChance(
      contextoChute({
        goleiro: jogador("g", { reflexes: 95, gk_positioning: 95, gk_one_on_one: 95 }),
      })
    );
    expect(forte).toBeLessThan(fraco);
  });

  it("pé dominante aumenta a chance (§55)", () => {
    const comPeBom = calcShotChance(contextoChute({ usandoPeDominante: true }));
    const comPeRuim = calcShotChance(contextoChute({ usandoPeDominante: false }));
    expect(comPeBom).toBeGreaterThan(comPeRuim);
  });

  it("ângulo frontal aumenta a chance (§55)", () => {
    const frontal = calcShotChance(contextoChute({ angulo: 1 }));
    const fechado = calcShotChance(contextoChute({ angulo: 0.05 }));
    expect(frontal).toBeGreaterThan(fechado);
  });

  it("distância maior reduz a chance (§55)", () => {
    const perto = calcShotChance(contextoChute({ distancia: 5 }));
    const longe = calcShotChance(contextoChute({ distancia: 35 }));
    expect(longe).toBeLessThan(perto);
  });

  it("pressão defensiva reduz a chance (§55)", () => {
    const livre = calcShotChance(contextoChute({ pressao: 0 }));
    const marcado = calcShotChance(contextoChute({ pressao: 90 }));
    expect(marcado).toBeLessThan(livre);
  });

  it("mantém a chance dentro da faixa de sanidade", () => {
    const pessimo = calcShotChance(
      contextoChute({
        atacante: jogador("a", { finishing: 1, composure: 1, positioning: 1 }),
        goleiro: jogador("g", { reflexes: 100, gk_positioning: 100, gk_one_on_one: 100 }),
        usandoPeDominante: false,
        angulo: 0,
        distancia: 50,
        pressao: 100,
        condicao: 0,
        forma: -10,
      })
    );
    expect(pessimo).toBeGreaterThanOrEqual(0.01);

    const perfeito = calcShotChance(
      contextoChute({
        atacante: jogador("a", { finishing: 100, composure: 100, positioning: 100 }),
        goleiro: jogador("g", { reflexes: 1, gk_positioning: 1, gk_one_on_one: 1 }),
        usandoPeDominante: true,
        angulo: 1,
        distancia: 1,
        pressao: 0,
        condicao: 100,
        forma: 10,
      })
    );
    expect(perfeito).toBeLessThanOrEqual(0.8);
  });
});

// ---------------------------------------------------------------------------
// Resolução (sorteio determinístico — §104, §56)
// ---------------------------------------------------------------------------

describe("resolve* — sorteio com RNG determinístico (§104, §56)", () => {
  it("mesma seed gera a mesma sequência de desfechos (passe)", () => {
    const a = createRng(42);
    const b = createRng(42);
    const ctx = contextoPasse();

    for (let i = 0; i < 50; i++) {
      expect(resolvePass(ctx, a).sucesso).toBe(resolvePass(ctx, b).sucesso);
    }
  });

  it("o resultado respeita a chance sorteada (invariante)", () => {
    const rng = createRng(7);
    const ctx = contextoPasse();
    for (let i = 0; i < 20; i++) {
      const r = resolvePass(ctx, rng);
      expect(r.chance).toBe(calcPassChance(ctx));
      expect(typeof r.sucesso).toBe("boolean");
    }
  });

  it("favorito claro vence a maioria dos duelos (sanidade de §56)", () => {
    const rng = createRng(918281982);
    const golFeichado = contextoChute({
      atacante: jogador("a", { finishing: 99, composure: 99, positioning: 99 }),
      goleiro: jogador("g", { reflexes: 1, gk_positioning: 1, gk_one_on_one: 1 }),
      usandoPeDominante: true,
      angulo: 1,
      distancia: 5,
      pressao: 0,
    });

    const tentativas = 1000;
    let sucessos = 0;
    for (let i = 0; i < tentativas; i++) {
      if (resolveShot(golFeichado, rng).sucesso) sucessos++;
    }
    // Chance máxima do chute é 0.80 (clamp) — esperamos bem acima da metade.
    expect(sucessos).toBeGreaterThan(tentativas * 0.6);
  });

  it("drible e passe usam o mesmo padrão de API", () => {
    const rng = createRng(1);
    const passe = resolvePass(contextoPasse(), rng);
    const drible = resolveDribble(contextoDrible(), rng);
    expect(passe.chance).toBeGreaterThan(0);
    expect(drible.chance).toBeGreaterThan(0);
    expect(typeof passe.sucesso).toBe("boolean");
    expect(typeof drible.sucesso).toBe("boolean");
  });
});

// ---------------------------------------------------------------------------
// Validações (mensagens em PT-BR)
// ---------------------------------------------------------------------------

describe("validação dos contextos", () => {
  it("rejeita pressão fora de 0–100", () => {
    expect(() => calcPassChance(contextoPasse({ pressao: -1 }))).toThrow(/pressao/);
    expect(() => calcShotChance(contextoChute({ pressao: 101 }))).toThrow(/pressao/);
  });

  it("rejeita distância negativa", () => {
    expect(() => calcPassChance(contextoPasse({ distancia: -5 }))).toThrow(/distancia/);
    expect(() => calcShotChance(contextoChute({ distancia: -5 }))).toThrow(/distancia/);
  });

  it("rejeita ângulo fora de 0–1", () => {
    expect(() => calcShotChance(contextoChute({ angulo: 1.5 }))).toThrow(/angulo/);
  });

  it("rejeita condição fora de 0–100 e forma fora de −10..+10", () => {
    expect(() => calcPassChance(contextoPasse({ condicao: 120 }))).toThrow(/condicao/);
    expect(() => calcDribbleChance(contextoDrible({ forma: 15 }))).toThrow(/forma/);
  });

  it("rejeita entrosamento fora de 0–100", () => {
    expect(() => calcPassChance(contextoPasse({ entrosamento: -1 }))).toThrow(/entrosamento/);
  });
});

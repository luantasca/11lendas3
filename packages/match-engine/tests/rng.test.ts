import { describe, expect, it } from "vitest";
import { createRng } from "../src/rng.js";

/**
 * Testes do RNG determinístico.
 *
 * Os valores "golden" (0.6011037519201636, ...) foram gerados pelo próprio
 * algoritmo mulberry32 com seed 42 e funcionam como trava de regressão:
 * se alguém alterar o algoritmo sem querer, estes testes falham e obrigam
 * a revisão documentada da mudança (pois alterar o RNG quebra a
 * reprodução de partidas antigas - GDD seção 104).
 */
describe("createRng", () => {
  it("gera a mesma sequência para a mesma seed", () => {
    const a = createRng(42);
    const b = createRng(42);

    const sequenciaA = Array.from({ length: 100 }, () => a.next());
    const sequenciaB = Array.from({ length: 100 }, () => b.next());

    expect(sequenciaA).toEqual(sequenciaB);
  });

  it("gera sequências diferentes para seeds diferentes", () => {
    const a = createRng(1);
    const b = createRng(2);

    const sequenciaA = Array.from({ length: 10 }, () => a.next());
    const sequenciaB = Array.from({ length: 10 }, () => b.next());

    expect(sequenciaA).not.toEqual(sequenciaB);
  });

  it("mantém os valores golden da seed 42 (trava de regressão)", () => {
    const rng = createRng(42);

    const esperado = [
      0.6011037519201636, 0.44829055899754167, 0.8524657934904099,
      0.6697340414393693, 0.17481389874592423,
    ];
    const obtido = esperado.map(() => rng.next());

    expect(obtido).toEqual(esperado);
  });

  it("retorna sempre valores no intervalo [0, 1)", () => {
    const rng = createRng(12345);

    for (let i = 0; i < 10_000; i++) {
      const valor = rng.next();
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    }
  });

  it("nextInt respeita os limites informados", () => {
    const rng = createRng(7);

    for (let i = 0; i < 10_000; i++) {
      const valor = rng.nextInt(10);
      expect(Number.isInteger(valor)).toBe(true);
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(10);
    }
  });

  it("nextInt rejeita valores inválidos", () => {
    const rng = createRng(7);
    expect(() => rng.nextInt(0)).toThrow();
    expect(() => rng.nextInt(-5)).toThrow();
    expect(() => rng.nextInt(2.5)).toThrow();
  });

  it("rejeita seed que não seja inteira", () => {
    expect(() => createRng(42.5)).toThrow();
    expect(() => createRng(NaN)).toThrow();
  });

  it("preserva a seed original informada", () => {
    expect(createRng(918281982).seed).toBe(918281982);
  });
});

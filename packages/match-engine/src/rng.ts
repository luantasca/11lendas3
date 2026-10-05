/**
 * Gerador de números pseudoaleatórios determinístico (algoritmo mulberry32).
 *
 * Motivo (GDD seção 104 - "Simulação Determinística"):
 * cada partida deve receber uma `match_seed`. Com a mesma seed, a mesma
 * sequência de números é gerada, permitindo reproduzir a partida exatamente
 * para debugging, suporte, testes e investigação de bugs.
 *
 * Por isso este módulo NÃO utiliza Math.random(): qualquer aleatoriedade
 * do motor de partidas deve vir de um RNG com seed explícita.
 *
 * Referência do algoritmo: mulberry32 - rápido, boa qualidade estatística
 * para simulação e ocupa apenas 32 bits de estado.
 */

/** Interface pública do gerador determinístico. */
export interface Rng {
  /** Retorna um número pseudoaleatório no intervalo [0, 1). */
  next(): number;
  /**
   * Retorna um inteiro no intervalo [0, maxExclusive).
   * Lança erro se maxExclusive não for inteiro positivo.
   */
  nextInt(maxExclusive: number): number;
  /** Seed original usada na criação do gerador (para registro/logs). */
  readonly seed: number;
}

/**
 * Cria um gerador determinístico a partir de uma seed de 32 bits.
 *
 * @param seed Seed numérica (qualquer inteiro; é normalizado para 32 bits sem sinal).
 * @returns Instância de {@link Rng} com a sequência determinística da seed.
 */
export function createRng(seed: number): Rng {
  if (!Number.isInteger(seed)) {
    throw new Error(`Seed deve ser um número inteiro. Recebido: ${seed}`);
  }

  const originalSeed = seed >>> 0;
  let state = originalSeed;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error(
        `maxExclusive deve ser um inteiro positivo. Recebido: ${maxExclusive}`
      );
    }
    return Math.floor(next() * maxExclusive);
  };

  return { next, nextInt, seed: originalSeed };
}

/**
 * xG (Expected Goals) — etapa 5 do motor.
 *
 * Referência do GDD §60: "Cada finalização poderá receber um valor de
 * Expected Goals. Exemplo: Chute fora da área: 0.05; Cabeçada: 0.12;
 * Cara a cara: 0.42; Pênalti: 0.76."
 *
 * A tabela abaixo reproduz fielmente os valores da §60 como ponto de
 * partida. Modelagem contínua por distância/ângulo é calibração futura
 * (playtest — ver ADR-010 e docs/REGISTRO-DE-ALTERACOES.md).
 */

/** Tipos de finalização com xG base (GDD §60). */
export type ShotType = "FORA_DA_AREA" | "CABECADA" | "CARA_A_CARA" | "PENALTI";

/** Valores base do xG conforme exemplos do GDD §60. */
const XG_BASE: Record<ShotType, number> = {
  FORA_DA_AREA: 0.05, // Chute fora da área
  CABECADA: 0.12, // Cabeçada
  CARA_A_CARA: 0.42, // Cara a cara
  PENALTI: 0.76, // Pênalti
};

/**
 * Retorna o xG base de uma finalização (GDD §60).
 *
 * @param tipo tipo da finalização.
 * @returns valor entre 0 e 1.
 */
export function calcularXg(tipo: ShotType): number {
  return XG_BASE[tipo];
}

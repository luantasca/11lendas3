/**
 * Resolução de ações por atributos — etapa 3 do motor.
 *
 * Referências do GDD:
 * - §54: exemplo do motor (passe vertical identificado pela situação).
 * - §55: cada ação utiliza atributos específicos:
 *     Passe        → Passe, Visão, Decisão vs pressão, distância,
 *                    posicionamento do receptor, entrosamento.
 *     Drible       → Drible, Agilidade, Aceleração, Decisão vs
 *                    Desarme, Posicionamento, Agilidade do marcador.
 *     Finalização → Finalização, Composição, Posicionamento, pé
 *                    dominante, ângulo, distância, pressão vs
 *                    Reflexo, Posicionamento, 1×1 do goleiro.
 * - §56: aleatoriedade controlada (a camada de equilíbrio estatístico
 *   é a etapa 4 — aqui o desfecho já usa o RNG determinístico).
 * - §57: fórmula conceitual AÇÃO = técnica + mental + tática + condição
 *   + forma + entrosamento + aleatoriedade − pressão adversária.
 * - §103: o motor recebe atributos; §104: tudo determinístico por seed.
 *
 * ⚠️ Constantes PROVISÓRIAS de equilíbrio (o GDD não informa valores):
 * documentadas no ADR-009 e sujeitas a ajuste por playtest.
 *
 * ⚠️ "Situação tática" (§57) ainda não entra no cálculo: as ações ainda
 * não foram integradas ao ciclo da partida (ver docs/03-ROADMAP.md).
 */
import type { Rng } from "./rng.js";
import type { Player } from "./player.js";

// ---------------------------------------------------------------------------
// Constantes de equilíbrio (PROVISÓRIAS — ADR-009)
// ---------------------------------------------------------------------------

/** 1 ponto de atributo/modificador = 1% de chance (0.01). */
const PONTO_DE_CHANCE = 0.01;

// Modificadores de estado (§57 — condição, forma, entrosamento)
const FATOR_CONDICAO = 0.2; // pontos por % abaixo de 100 (§16)
const FATOR_FORMA = 0.5; // pontos por nível de forma −10..+10 (§15)
const FATOR_ENTROSAMENTO = 0.15; // pontos por ponto em relação a 50 (§17)

// Modificadores específicos de ação (§55)
const FATOR_POSICIONAMENTO_RECEPTOR = 0.2; // pontos por ponto acima de 50
const FATOR_DISTANCIA_PASSE = 0.3; // pontos por metro
const FATOR_DISTANCIA_CHUTE = 0.3; // pontos por metro
const FATOR_PRESSAO_CHUTE = 0.35; // pontos por ponto de pressão (0–100)
const FATOR_ANGULO = 20; // (angulo − 0.5) × 20 pontos (angulo 0–1)
const BONUS_PE_DOMINANTE = 5; // pontos (±)

// Bases de chance por ação (§55: o passe/drible são duelos diretos —
// base 0.50; o chute real converge para ~10–30% — calibrar com xG na etapa 5)
const BASE_PASSE = 0.5;
const BASE_DRIBLE = 0.5;
const BASE_FINALIZACAO = 0.3;

// Faixas finais de chance (clamps de sanidade)
const FAIXA_DUELO_MIN = 0.05;
const FAIXA_DUELO_MAX = 0.95;
const FAIXA_CHUTE_MIN = 0.01;
const FAIXA_CHUTE_MAX = 0.8;

// ---------------------------------------------------------------------------
// Contextos das ações (§55)
// ---------------------------------------------------------------------------

/** Estado do jogador no campo — opcional com valores neutros (§15–§17). */
interface EstadoJogador {
  /** Condição física 0–100% (GDD §16). Padrão: 100. */
  condicao?: number;
  /** Forma −10 a +10 (GDD §15). Padrão: 0. */
  forma?: number;
}

/** Contexto do passe (GDD §55). */
export interface PassContext extends EstadoJogador {
  /** Quem executa o passe. */
  atacante: Player;
  /** Quem recebe — entra pelo posicionamento (GDD §55). */
  receptor: Player;
  /** Pressão adversária sobre quem passa, 0–100 (GDD §55). */
  pressao: number;
  /** Distância do passe em metros (GDD §55). */
  distancia: number;
  /** Entrosamento do time 0–100 (GDD §17, §55). Padrão: 50 (neutro). */
  entrosamento?: number;
}

/** Contexto do drible (GDD §55). */
export interface DribbleContext extends EstadoJogador {
  /** Quem tenta o drible. */
  atacante: Player;
  /** Quem tenta desarmar. */
  marcador: Player;
}

/** Contexto da finalização (GDD §55). */
export interface ShotContext extends EstadoJogador {
  /** Quem finaliza. */
  atacante: Player;
  /** Quem defende. */
  goleiro: Player;
  /** O chute sai com o pé dominante? (GDD §55 — pé dominante). */
  usandoPeDominante: boolean;
  /** Abertura do ângulo 0–1 (0 = fechado, 1 = frontal — GDD §55). */
  angulo: number;
  /** Distância do chute em metros (GDD §55). */
  distancia: number;
  /** Pressão defensiva sobre o finalizador 0–100 (GDD §55). */
  pressao: number;
}

/** Resultado da resolução de uma ação. */
export interface ActionResult {
  /** A ação deu certo? (sorteio via RNG determinístico — §104). */
  sucesso: boolean;
  /** Probabilidade usada no sorteio, em [0, 1]. */
  chance: number;
}

// ---------------------------------------------------------------------------
// Auxiliares
// ---------------------------------------------------------------------------

function validarFaixa(
  valor: number,
  min: number,
  max: number,
  nome: string
): void {
  if (Number.isNaN(valor) || valor < min || valor > max) {
    throw new Error(`${nome} deve estar entre ${min} e ${max}. Recebido: ${valor}`);
  }
}

function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/** Modificadores de estado em "pontos" (§57 — condição, forma). */
function pontosDeEstado(estado: EstadoJogador): number {
  const condicao = estado.condicao ?? 100;
  const forma = estado.forma ?? 0;
  validarFaixa(condicao, 0, 100, "condicao");
  validarFaixa(forma, -10, 10, "forma");
  return (condicao - 100) * FATOR_CONDICAO + forma * FATOR_FORMA;
}

function chanceFinal(base: number, pontos: number, min: number, max: number): number {
  return clamp(base + pontos * PONTO_DE_CHANCE, min, max);
}

// ---------------------------------------------------------------------------
// Cálculo de chance (determinístico — sem RNG)
// ---------------------------------------------------------------------------

/**
 * Chance de um passe ser concluído (GDD §55).
 * Qualidade técnica = Passe/Visão/Decisão; defesa = pressão adversária;
 * ajustes = posicionamento do receptor, entrosamento, distância, condição
 * e forma (§57).
 */
export function calcPassChance(context: PassContext): number {
  const a = context.atacante.attributes;
  const { pressao, distancia, entrosamento = 50 } = context;

  validarFaixa(pressao, 0, 100, "pressao");
  validarFaixa(distancia, 0, 100, "distancia");
  validarFaixa(entrosamento, 0, 100, "entrosamento");

  const qualidade =
    0.5 * a.passing + 0.3 * a.vision + 0.2 * a.decisions;
  const pontos =
    qualidade -
    pressao +
    (context.receptor.attributes.positioning - 50) * FATOR_POSICIONAMENTO_RECEPTOR +
    (entrosamento - 50) * FATOR_ENTROSAMENTO -
    distancia * FATOR_DISTANCIA_PASSE +
    pontosDeEstado(context);

  return chanceFinal(BASE_PASSE, pontos, FAIXA_DUELO_MIN, FAIXA_DUELO_MAX);
}

/**
 * Chance de um drible ser concluído (GDD §55).
 * Ataque = Drible/Agilidade/Aceleração/Decisão;
 * defesa = Desarme/Posicionamento/Agilidade do marcador.
 */
export function calcDribbleChance(context: DribbleContext): number {
  const a = context.atacante.attributes;
  const d = context.marcador.attributes;

  const ataque =
    0.4 * a.dribbling + 0.2 * a.agility + 0.2 * a.acceleration + 0.2 * a.decisions;
  const defesa = 0.4 * d.tackling + 0.3 * d.positioning + 0.3 * d.agility;

  const pontos = ataque - defesa + pontosDeEstado(context);

  return chanceFinal(BASE_DRIBLE, pontos, FAIXA_DUELO_MIN, FAIXA_DUELO_MAX);
}

/**
 * Chance de um chute sair gol (GDD §55).
 * Ataque = Finalização/Composição/Posicionamento; defesa = Reflexo/
 * Posicionamento/1×1 do goleiro; ajustes = pé dominante, ângulo,
 * distância, pressão defensiva, condição e forma.
 */
export function calcShotChance(context: ShotContext): number {
  const a = context.atacante.attributes;
  const gk = context.goleiro.attributes;
  const { usandoPeDominante, angulo, distancia, pressao } = context;

  validarFaixa(angulo, 0, 1, "angulo");
  validarFaixa(distancia, 0, 100, "distancia");
  validarFaixa(pressao, 0, 100, "pressao");

  const ataque = 0.5 * a.finishing + 0.3 * a.composure + 0.2 * a.positioning;
  const defesa =
    0.4 * gk.reflexes + 0.3 * gk.gk_positioning + 0.3 * gk.gk_one_on_one;

  const pontos =
    ataque -
    defesa +
    (usandoPeDominante ? BONUS_PE_DOMINANTE : -BONUS_PE_DOMINANTE) +
    (angulo - 0.5) * FATOR_ANGULO -
    distancia * FATOR_DISTANCIA_CHUTE -
    pressao * FATOR_PRESSAO_CHUTE +
    pontosDeEstado(context);

  return chanceFinal(BASE_FINALIZACAO, pontos, FAIXA_CHUTE_MIN, FAIXA_CHUTE_MAX);
}

// ---------------------------------------------------------------------------
// Resolução (sorteio com RNG determinístico — §104, §56)
// ---------------------------------------------------------------------------

/** Sorteia o desfecho do passe usando o RNG da partida. */
export function resolvePass(context: PassContext, rng: Rng): ActionResult {
  const chance = calcPassChance(context);
  return { sucesso: rng.next() < chance, chance };
}

/** Sorteia o desfecho do drible usando o RNG da partida. */
export function resolveDribble(context: DribbleContext, rng: Rng): ActionResult {
  const chance = calcDribbleChance(context);
  return { sucesso: rng.next() < chance, chance };
}

/** Sorteia o desfecho da finalização usando o RNG da partida. */
export function resolveShot(context: ShotContext, rng: Rng): ActionResult {
  const chance = calcShotChance(context);
  return { sucesso: rng.next() < chance, chance };
}

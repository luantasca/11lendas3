/**
 * Simulação do ciclo — integração das ações ao motor (ADR-012).
 *
 * Referências do GDD:
 * - §52: cada ciclo atualiza posse, bola e eventos.
 * - §53: fases da posse (DEFESA → CONSTRUÇÃO → MEIO-CAMPO → ATAQUE →
 *   ÚLTIMO TERÇO → CHANCE → FINALIZAÇÃO).
 * - §54: exemplo do motor — recuperação, passe vertical, novo evento.
 * - §55: ações resolvidas por atributos (etapa 3).
 * - §60: toda finalização recebe xG.
 * - §91: tipos de evento.
 *
 * Simplificações documentadas (ADR-012 — NÃO inventadas em silêncio):
 * - 1 ação por ciclo: 70% passe / 30% drible (provisório).
 * - Pressão adversária mapeada pela fase atual (tabela provisória).
 * - Sucesso avança a fase; fracasso = perda de posse + evento TACKLE.
 * - Sem faltas, cartões, escanteios, impedimentos e substituições —
 *   exigem regras de descontinuidade (etapa 7).
 * - Chute registrado sempre no gol (sem "fora") — simplificação.
 * - Seleção de goleiro/comparsas por atributos (sem posições na ficha;
 *   §87 entra na etapa 7).
 * - Entrosamento neutro (50) e forma 0 — não rastreados ainda (§17, §15).
 */
import { criarEvento } from "./events.js";
import type { MatchEvent } from "./events.js";
import { resolveDribble, resolvePass, resolveShot } from "./actions.js";
import { calcularXg } from "./xg.js";
import type { ShotType } from "./xg.js";
import type { Player } from "./player.js";
import type { MatchState, PossessionPhase } from "./match-state.js";
import type { Rng } from "./rng.js";

/** Ordem das fases da posse (GDD §53). */
const ORDEM_FASES: readonly PossessionPhase[] = [
  "DEFESA",
  "CONSTRUCAO",
  "MEIO_CAMPO",
  "ATAQUE",
  "ULTIMO_TERCO",
  "CHANCE",
  "FINALIZACAO",
];

/** Pressão adversária por fase (PROVISÓRIA — quanto mais perto do gol, maior). */
const PRESSAO_POR_FASE: Record<PossessionPhase, number> = {
  DEFESA: 20,
  CONSTRUCAO: 30,
  MEIO_CAMPO: 45,
  ATAQUE: 60,
  ULTIMO_TERCO: 75,
  CHANCE: 90,
  FINALIZACAO: 40,
};

/** Posição-x alvo por fase, do ponto de vista de quem ataca (0–100). */
const X_ALVO_POR_FASE: Record<PossessionPhase, number> = {
  DEFESA: 15,
  CONSTRUCAO: 30,
  MEIO_CAMPO: 50,
  ATAQUE: 65,
  ULTIMO_TERCO: 80,
  CHANCE: 90,
  FINALIZACAO: 90, // FINALIZACAO usa faixa sorteada (ver avancarFase)
};

/** Probabilidade de ação ser passe (senão, drible) — PROVISÓRIA. */
const PROB_PASS = 0.7;

/** Pressão sobre o finalizador (PROVISÓRIA). */
const PRESSAO_CHUTE = 40;

/** Pé dominante usado no chute (probabilidade provisória). */
const PROB_PE_DOMINANTE = 0.7;

/** Distância (em unidades do campo) a partir da qual é "fora da área". */
const LIMITE_FORA_DA_AREA = 16;

/** Entrosamento neutro — §17 não implementado ainda (ADR-012). */
const ENTROSAMENTO_NEUTRO = 50;

/** Elencos das duas equipes, usados pela simulação (GDD §103). */
export interface Elencos {
  home: Player[];
  away: Player[];
}

function escolher(lista: Player[], rng: Rng): Player {
  const escolhido = lista[rng.nextInt(lista.length)];
  if (escolhido === undefined) {
    throw new Error("Lista de jogadores vazia na simulação.");
  }
  return escolhido;
}

function melhorPor(squad: Player[], nota: (p: Player) => number): Player | null {
  let melhor: Player | null = null;
  for (const jogador of squad) {
    if (melhor === null || nota(jogador) > nota(melhor)) {
      melhor = jogador;
    }
  }
  return melhor;
}

/** Goleiro = maior combinação de atributos de defesa (provisório, ADR-012). */
function escolherGoleiro(squad: Player[]): Player {
  const goleiro = melhorPor(
    squad,
    (p) =>
      p.attributes.gk_positioning +
      p.attributes.reflexes +
      p.attributes.gk_one_on_one
  );
  if (goleiro === null) throw new Error("Elenco vazio na simulação.");
  return goleiro;
}

/** Melhor marcador do time (provisório, ADR-012). */
function escolherMarcador(squad: Player[]): Player {
  const marcador = melhorPor(
    squad,
    (p) => p.attributes.tackling + p.attributes.marking + p.attributes.interceptions
  );
  if (marcador === null) throw new Error("Elenco vazio na simulação.");
  return marcador;
}

function jogadoresDeCampo(squad: Player[], goleiroId: string): Player[] {
  return squad.filter((p) => p.id !== goleiroId);
}

/** Posição-x alvo de uma fase, já espelhada para o lado de quem ataca. */
function alvoX(fase: PossessionPhase, atacandoCasa: boolean): number {
  const base = X_ALVO_POR_FASE[fase];
  return atacandoCasa ? base : 100 - base;
}

function proximaFase(fase: PossessionPhase): PossessionPhase | null {
  const indice = ORDEM_FASES.indexOf(fase);
  const proxima = ORDEM_FASES[indice + 1];
  return proxima === undefined ? null : proxima;
}

/** Avança a fase e mova a bola na direção do ataque (GDD §52–§53). */
function avancarFase(
  state: MatchState,
  atacandoCasa: boolean,
  rng: Rng
): Pick<MatchState, "phase" | "ball"> {
  const fase = state.phase;
  const proxima = proximaFase(fase);
  if (proxima === null) {
    return { phase: fase, ball: state.ball };
  }

  if (proxima === "FINALIZACAO") {
    // Faixa próxima ao gol (sorteada) — dá variedade de ângulo/distância.
    const xCasa = 78 + rng.next() * 19; // 78..97
    return {
      phase: "FINALIZACAO",
      ball: {
        x: atacandoCasa ? xCasa : 100 - xCasa,
        y: 25 + rng.next() * 50, // 25..75
      },
    };
  }

  return {
    phase: proxima,
    ball: {
      x: alvoX(proxima, atacandoCasa),
      y: 20 + rng.next() * 60, // 20..80
    },
  };
}

/** Perda de posse: a outra equipe recupera (GDD §54). */
function perdeuPosse(
  state: MatchState,
  atacandoCasa: boolean,
  rng: Rng
): Pick<MatchState, "possessionClubId" | "phase" | "ball" | "lastPasserId"> {
  const novaCasa = !atacandoCasa;
  // Recuperação na própria terço → fase DEFESA; senão, MEIO-CAMPO.
  const recuperouFundo = novaCasa ? state.ball.x <= 35 : state.ball.x >= 65;
  return {
    possessionClubId: novaCasa ? state.homeClubId : state.awayClubId,
    phase: recuperouFundo ? "DEFESA" : "MEIO_CAMPO",
    ball: {
      x: alvoX(recuperouFundo ? "DEFESA" : "MEIO_CAMPO", novaCasa),
      y: 30 + rng.next() * 40,
    },
    lastPasserId: null,
  };
}

/** Finalização: sorteia desfecho e atualiza placar/posse (§55, §60). */
function finalizar(
  state: MatchState,
  atacandoCasa: boolean,
  campoAtaque: Player[],
  goleiro: Player,
  rng: Rng
): MatchState {
  const finalizador = escolher(campoAtaque, rng);

  const distancia = atacandoCasa ? 100 - state.ball.x : state.ball.x;
  const angulo = 1 - Math.abs(state.ball.y - 50) / 50;
  const tipo: ShotType = distancia > LIMITE_FORA_DA_AREA ? "FORA_DA_AREA" : "CARA_A_CARA";
  const xg = calcularXg(tipo);
  const usandoPeDominante = rng.next() < PROB_PE_DOMINANTE;

  const chute = resolveShot(
    {
      atacante: finalizador,
      goleiro,
      usandoPeDominante,
      angulo,
      distancia,
      pressao: PRESSAO_CHUTE,
      condicao: state.conditions[finalizador.id] ?? 100,
    },
    rng
  );

  const eventos: MatchEvent[] = [
    criarEvento({
      gameSecond: state.gameSecond,
      type: "SHOT",
      clubId: state.possessionClubId,
      playerId: finalizador.id,
      metadata: { xg, noGol: true }, // ADR-012: chute sempre no gol
    }),
  ];

  if (chute.sucesso) {
    const timeAdversario = atacandoCasa ? state.awayClubId : state.homeClubId;
    eventos.push(
      criarEvento({
        gameSecond: state.gameSecond,
        type: "GOAL",
        clubId: state.possessionClubId,
        playerId: finalizador.id,
        secondaryPlayerId:
          state.lastPasserId !== null && state.lastPasserId !== finalizador.id
            ? state.lastPasserId
            : undefined,
      })
    );
    return {
      ...state,
      homeScore: atacandoCasa ? state.homeScore + 1 : state.homeScore,
      awayScore: atacandoCasa ? state.awayScore : state.awayScore + 1,
      events: [...state.events, ...eventos],
      // Reposição do adversário (quem sofreu o gol recomeça).
      possessionClubId: timeAdversario,
      phase: "CONSTRUCAO",
      ball: { x: 50, y: 50 },
      lastPasserId: null,
    };
  }

  // Defesa do goleiro: ele segura a bola e o time dele recomeça (§53).
  const clubeDefesa = atacandoCasa ? state.awayClubId : state.homeClubId;
  const atacaAgoraCasa = !atacandoCasa;
  eventos.push(
    criarEvento({
      gameSecond: state.gameSecond,
      type: "SAVE",
      clubId: clubeDefesa,
      playerId: goleiro.id,
      secondaryPlayerId: finalizador.id,
    })
  );
  return {
    ...state,
    events: [...state.events, ...eventos],
    possessionClubId: clubeDefesa,
    phase: "CONSTRUCAO",
    ball: { x: alvoX("CONSTRUCAO", atacaAgoraCasa), y: 50 },
    lastPasserId: null,
  };
}

/**
 * Simula um ciclo (1 segundo) de jogo — 1 ação (passe ou drible),
 * avanço de fase ou finalização, gerando eventos (GDD §52–§55).
 *
 * Função determinística: mesmos estado + RNG + elencos → mesmos eventos.
 *
 * @param state estado no início do ciclo (imutável — nada é modificado).
 * @param rng RNG da partida (GDD §104).
 * @param elencos elencos das duas equipes (GDD §103).
 * @returns novo estado após o ciclo.
 */
export function simularCiclo(
  state: MatchState,
  rng: Rng,
  elencos: Elencos
): MatchState {
  const atacandoCasa = state.possessionClubId === state.homeClubId;
  const elencoAtaque = atacandoCasa ? elencos.home : elencos.away;
  const elencoDefesa = atacandoCasa ? elencos.away : elencos.home;
  // Goleiros: o da defesa defende; o do ataque NÃO entra em campo (§53).
  const goleiroDefesa = escolherGoleiro(elencoDefesa);
  const goleiroAtaque = escolherGoleiro(elencoAtaque);
  const campoDefesa = jogadoresDeCampo(elencoDefesa, goleiroDefesa.id);
  const campoAtaque = jogadoresDeCampo(elencoAtaque, goleiroAtaque.id);

  if (state.phase === "FINALIZACAO") {
    return finalizar(state, atacandoCasa, campoAtaque, goleiroDefesa, rng);
  }

  const portador = escolher(campoAtaque, rng);
  const condicao = state.conditions[portador.id] ?? 100;
  const pressao = PRESSAO_POR_FASE[state.phase];
  const eventos: MatchEvent[] = [];

  const usarPasse = rng.next() < PROB_PASS;

  if (usarPasse) {
    const opcoes = campoAtaque.filter((p) => p.id !== portador.id);
    const receptor = escolher(opcoes, rng);
    const destinoX = alvoX(
      proximaFase(state.phase) ?? state.phase,
      atacandoCasa
    );
    const distancia = Math.abs(destinoX - state.ball.x);

    const passe = resolvePass(
      {
        atacante: portador,
        receptor,
        pressao,
        distancia,
        entrosamento: ENTROSAMENTO_NEUTRO,
        condicao,
      },
      rng
    );

    if (passe.sucesso) {
      eventos.push(
        criarEvento({
          gameSecond: state.gameSecond,
          type: "PASS",
          clubId: state.possessionClubId,
          playerId: portador.id,
          secondaryPlayerId: receptor.id,
          metadata: { sucesso: true },
        })
      );
      const avanco = avancarFase(state, atacandoCasa, rng);
      return {
        ...state,
        ...avanco,
        events: [...state.events, ...eventos],
        lastPasserId: portador.id,
      };
    }

    // Passe perdido: rival recupera (TACKLE) — §54.
    eventos.push(
      criarEvento({
        gameSecond: state.gameSecond,
        type: "PASS",
        clubId: state.possessionClubId,
        playerId: portador.id,
        secondaryPlayerId: receptor.id,
        metadata: { sucesso: false },
      })
    );
    const marcador = escolherMarcador(campoDefesa);
    eventos.push(
      criarEvento({
        gameSecond: state.gameSecond,
        type: "TACKLE",
        clubId: state.possessionClubId === state.homeClubId ? state.awayClubId : state.homeClubId,
        playerId: marcador.id,
      })
    );
    return {
      ...state,
      ...perdeuPosse(state, atacandoCasa, rng),
      events: [...state.events, ...eventos],
    };
  }

  // Drible (§55): sucesso não tem tipo de evento na §91 (ADR-012).
  const marcador = escolherMarcador(campoDefesa);
  const drible = resolveDribble(
    { atacante: portador, marcador, condicao },
    rng
  );

  if (drible.sucesso) {
    const avanco = avancarFase(state, atacandoCasa, rng);
    return { ...state, ...avanco, events: [...state.events, ...eventos] };
  }

  eventos.push(
    criarEvento({
      gameSecond: state.gameSecond,
      type: "TACKLE",
      clubId: state.possessionClubId === state.homeClubId ? state.awayClubId : state.homeClubId,
      playerId: marcador.id,
    })
  );
  return {
    ...state,
    ...perdeuPosse(state, atacandoCasa, rng),
    events: [...state.events, ...eventos],
  };
}

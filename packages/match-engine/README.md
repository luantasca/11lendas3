# @manager/match-engine

Motor de partidas do **Manager de Futebol Online em Dupla**.

Este pacote implementa o motor de partidas descrito no GDD (`PROJETO.md`),
que deve ser **independente da interface** (seção 103) e **determinístico**
(seção 104).

## Status atual

| Etapa | Conteúdo | Situação |
|-------|----------|----------|
| 1 | RNG determinístico com seed (`mulberry32`) | ✅ Concluída |
| 2 | Estado da partida e ciclo de simulação (1 ciclo = 1 segundo) | ✅ Concluída |
| 3 | Resolução de ações por atributos (passe, drible, finalização) | ✅ Concluída |
| 4 | Aleatoriedade controlada embutida nas ações | ✅ Concluída |
| 5 | Eventos, estatísticas e xG | ✅ Concluída |
| 6 | Nota dos jogadores | ✅ Concluída |
| 7 | Prova de conceito (campo 2D, narração, táticas ao vivo) | ⬜ Próxima (após integração ao ciclo) |

> A ordem das etapas segue `docs/03-ROADMAP.md`. Não implementar etapas
> posteriores sem antes documentar a decisão.

## Por que começar pelo RNG?

O GDD (seção 104) exige que cada partida tenha uma `match_seed` permitindo
reproduzir a partida exatamente. Toda aleatoriedade do motor precisa vir de
um RNG com seed explícita — por isso `Math.random()` **não deve ser usado**
neste pacote.

## API

### RNG determinístico (etapa 1)

```ts
import { createRng } from "@manager/match-engine";

const rng = createRng(918281982); // match_seed da partida

rng.next();        // número em [0, 1)
rng.nextInt(10);   // inteiro em [0, 10)
rng.seed;          // 918281982 (seed original, para logs)
```

### Motor — estado e ciclo (etapa 2)

```ts
import { createMatchEngine, MATCH_DURATION_SECONDS } from "@manager/match-engine";

const engine = createMatchEngine({
  seed: 918281982,              // match_seed (GDD §104)
  homeClubId: "casa",
  awayClubId: "fora",
  homePlayerIds: ["p1", "p2"],  // escalação (posições entram na etapa 3)
  awayPlayerIds: ["p3", "p4"],
  tempo: "NORMAL",              // GDD §47 (opcional, padrão NORMAL)
  pressing: "NORMAL",           // GDD §48 (opcional, padrão NORMAL)
  initialCondition: 100,        // GDD §16 (opcional, padrão 100)
});

engine.state;   // estado atual (MatchState imutável)
engine.rng;     // RNG da partida
engine.tick();  // avança 1 ciclo = 1 segundo (GDD §52)
```

Cada `tick()` devolve um **novo** objeto de estado (imutável) e atualiza:
relógio (`gameSecond`), condição física de todos os jogadores (decaimento
provisório influenciado por ritmo/pressão — §47/§48) e `status` (a partida
encerra em `MATCH_DURATION_SECONDS` = 5400 s = 90 min).

**Premissas desta etapa** (detalhes em `docs/REGISTRO-DE-ALTERACOES.md`):
duração de 90 min, constantes de decaimento provisórias de equilíbrio,
fase inicial `CONSTRUCAO` e campo 2D normalizado 0–100. Transições de
fase, movimentação da bola, eventos e estatísticas pertencem às etapas
posteriores — ainda **não implementados**.

### Ações por atributos (etapa 3)

```ts
import {
  calcPassChance, calcDribbleChance, calcShotChance,
  resolvePass, resolveDribble, resolveShot,
} from "@manager/match-engine";

// Cálculo puro (determinístico, sem RNG) — útil para testes e UI:
const chance = calcPassChance({
  atacante,        // Player com atributos (GDD §10)
  receptor,        // posicionamento do receptor entra (§55)
  pressao: 40,     // 0–100 pressão adversária
  distancia: 15,   // metros
  entrosamento: 70,
  condicao: 92,    // opcional (padrão 100, §16)
  forma: 3,        // opcional (padrão 0, −10..+10, §15)
});

// Resolução com sorteio via RNG da partida (§104, §56):
const resultado = resolvePass(contexto, engine.rng);
// { sucesso: boolean, chance: number }
```

Idem `resolveDribble(atacante, marcador)` e
`resolveShot({ atacante, goleiro, usandoPeDominante, angulo, distancia, pressao })`.

> Ações são **funções independentes** — ainda não rodam dentro do ciclo
> da partida (integração futura, ver roadmap). Constantes de equilíbrio
> provisórias: ADR-009.

### Eventos, xG e estatísticas (etapa 5)

```ts
import {
  criarEvento, calcularXg, computeMatchStats,
} from "@manager/match-engine";

// Evento (GDD §91) — validado, com metadata documentada:
const chute = criarEvento({
  gameSecond: 734,
  type: "SHOT",
  clubId: "casa",
  playerId: "p10",
  metadata: { xg: calcularXg("CARA_A_CARA"), noGol: true }, // §60
});

// Estatísticas da §59 a partir dos eventos + posse (linha do tempo):
const stats = computeMatchStats({
  events: [chute],
  homeClubId: "casa",
  awayClubId: "fora",
  homePossessionSeconds: 2700,
  awayPossessionSeconds: 1800,
});
// stats.home: posse, finalizações, no gol, xG, passes, precisão,
// desarmes, escanteios, faltas, cartões
```

> Aleatoriedade controlada (etapa 4, §56) é garantida pelos clamps de
> chance e comprovada por testes estatísticos em
> `tests/controlled-randomness.test.ts` (10.000 tentativas por propriedade).

### Nota dos jogadores (etapa 6)

```ts
import { computePlayerRatings, RATING_INITIAL } from "@manager/match-engine";

// Nota inicial 6.0, escala 1.0–10.0 (GDD §61) — derivada dos eventos:
const notas = computePlayerRatings(events, ["p1", "p2", "p3"]);
// { p1: 7.4, p2: 6.0, p3: 5.7, ... }
```

Pesos por ação são **provisórios** (ADR-011); cada contribuição carrega
um `reason` em PT-BR (ex.: "Gol", "Defesa", "Cartão vermelho") pronto
para a narração futura (§42).

## Comandos

```bash
npm test              # roda os testes (na raiz do monorepo)
npm run typecheck     # verifica os tipos
```

## Convenções deste pacote

- Identificadores de código em inglês; comentários e documentação em PT-BR.
- Nenhum `Math.random()` — usar sempre `createRng` com seed.
- Toda alteração relevante deve ser registrada em
  `docs/REGISTRO-DE-ALTERACOES.md`.

Mais contexto: `docs/01-ARQUITETURA.md` e `docs/02-DECISOES-TECNICAS.md`.

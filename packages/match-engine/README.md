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
| 3 | Resolução de ações por atributos (passe, drible, finalização) | ⬜ Próxima |
| 4 | Aleatoriedade controlada embutida nas ações | ⬜ Não iniciada |
| 5 | Eventos, estatísticas e xG | ⬜ Não iniciada |
| 6 | Nota dos jogadores | ⬜ Não iniciada |
| 7 | Prova de conceito (campo 2D, narração, táticas ao vivo) | ⬜ Não iniciada |

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

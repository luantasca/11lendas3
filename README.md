# Manager de Futebol Online em Dupla

Jogo de manager de futebol online competitivo onde cada clube é administrado
por **dois jogadores humanos**: um **Presidente** (gestão administrativa e
financeira) e um **Técnico** (gestão esportiva e partidas).

> A fonte da verdade do jogo é o **[Game Design Document](PROJETO.md)** (`PROJETO.md`).
> Este README cobre apenas a implementação técnica.

## Status do projeto

**Fase:** fundação inicial (etapa 1 de desenvolvimento).

| Componente | Situação |
|------------|----------|
| Documentação técnica (`docs/`) | ✅ Inicial |
| Esqueleto do monorepo (workspaces + TypeScript + testes) | ✅ Inicial |
| `match-engine` — RNG determinístico (etapa 1) | ✅ Concluído |
| `match-engine` — estado e ciclo de simulação (etapa 2) | ✅ Concluído |
| `match-engine` — ações por atributos: passe, drible, finalização (etapa 3) | ✅ Concluído |
| `match-engine` — aleatoriedade controlada (etapa 4) | ✅ Concluído |
| `match-engine` — eventos, estatísticas e xG (etapa 5) | ✅ Concluído |
| `match-engine` — nota dos jogadores (etapa 6) | ✅ Concluído |
| `match-engine` — integração do ciclo: jogadas, gols e eventos (ADR-012) | ✅ Concluído |
| `match-engine` — prova de conceito (etapa 7) | ⬜ Não iniciada |
| App web, banco de dados, autenticação, draft, liga | ⬜ Não iniciados |

> Repositório Git: [github.com/luantasca/11lendas3](https://github.com/luantasca/11lendas3)
> (inicializado em 2026-10-05 — ver
> [`docs/REGISTRO-DE-ALTERACOES.md`](docs/REGISTRO-DE-ALTERACOES.md)).

## Requisitos

- Node.js **>= 16.17** (recomendado: 20 LTS — ver [ADR-006](docs/02-DECISOES-TECNICAS.md))
- npm >= 8

## Como rodar

```bash
npm install        # instala as dependências
npm test           # roda os testes de todos os pacotes
npm run typecheck  # verifica os tipos (TypeScript strict)
```

## Estrutura do projeto

```
.
├── PROJETO.md               # Game Design Document (fonte da verdade do jogo)
├── README.md                # Este arquivo
├── package.json             # Raiz do monorepo (npm workspaces)
├── tsconfig.base.json       # Configuração TypeScript compartilhada
├── docs/                    # Documentação técnica
│   ├── 01-ARQUITETURA.md
│   ├── 02-DECISOES-TECNICAS.md
│   ├── 03-ROADMAP.md
│   ├── 04-CONVENCOES.md
│   ├── 05-GUIA-DE-CONTINUACAO.md
│   └── REGISTRO-DE-ALTERACOES.md
└── packages/
    └── match-engine/        # Motor de partidas (etapa 1: RNG determinístico)
```

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/01-ARQUITETURA.md](docs/01-ARQUITETURA.md) | Visão técnica, estrutura e princípios |
| [docs/02-DECISOES-TECNICAS.md](docs/02-DECISOES-TECNICAS.md) | ADRs — decisões técnicas e seus motivos |
| [docs/03-ROADMAP.md](docs/03-ROADMAP.md) | Etapas e prioridades (baseado no GDD) |
| [docs/04-CONVENCOES.md](docs/04-CONVENCOES.md) | Padrões de código, testes e documentação |
| [docs/05-GUIA-DE-CONTINUACAO.md](docs/05-GUIA-DE-CONTINUACAO.md) | Como retomar o trabalho com segurança |
| [docs/REGISTRO-DE-ALTERACOES.md](docs/REGISTRO-DE-ALTERACOES.md) | Histórico de alterações por sessão |

## Princípios de desenvolvimento

1. **Motor antes de interface** — validar o motor de partidas primeiro (GDD §113).
2. **Tudo documentado** — toda alteração relevante é registrada em
   `docs/REGISTRO-DE-ALTERACOES.md`; decisões técnicas viram ADR.
3. **Determinismo** — toda aleatoriedade do motor usa seed explícita (GDD §104).
4. **Nada inventado** — funcionalidades só existem se estiverem no GDD ou
   forem registradas como decisão documentada.

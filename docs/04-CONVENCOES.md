# 04 — Convenções

> Padrões que devem ser seguidos em todo o projeto para manter consistência
> e permitir continuação segura por qualquer pessoa (ou sessão futura).

## 1. Idioma

| O quê | Idioma |
|-------|--------|
| Respostas, explicações, mensagens ao usuário | Português (Brasil) |
| Documentação (`docs/`, `README.md`) | Português (Brasil) |
| Comentários no código e mensagens de erro | Português (Brasil) |
| Identificadores, nomes de arquivo de código, chaves de API | Inglês |

(Ver [ADR-007](02-DECISOES-TECNICAS.md).)

## 2. Código

- **TypeScript strict** — herdado de `tsconfig.base.json`; não desativar
  `strict` em nenhum pacote.
- **Nomes:** arquivos em `kebab-case` (`match-engine.ts`); funções/variáveis
  em `camelCase`; tipos/Interfaces em `PascalCase`.
- **Exports nomeados** (evitar `export default`) — facilita refatoração e
  busca de referências.
- **Sem código duplicado:** se algo se repete em dois pacotes, extrair para um
  pacote compartilhado e documentar a decisão.
- **Proibido `Math.random()`** dentro de `packages/match-engine`
  (ver [ADR-005](02-DECISOES-TECNICAS.md)).
- **Sem supressões de tipo** (`@ts-ignore`, `any` implícito) para fazer o
  check passar — corrigir a causa.

## 3. Testes

- Arquivos em `packages/<pacote>/tests/*.test.ts`.
- **Todo código novo do motor de partidas entra com teste.**
- Testes usam importação explícita: `import { describe, it, expect } from "vitest"`.
- Funcionalidades críticas de simulação possuem **valores golden**
  (sequências fixas) como trava de regressão — exemplo:
  `tests/rng.test.ts`.
- Antes de considerar uma tarefa pronta: `npm test` **e**
  `npm run typecheck` devem passar na raiz.

## 4. Documentação (obrigatória)

Toda alteração relevante exige:

1. **Entrada em [REGISTRO-DE-ALTERACOES.md](REGISTRO-DE-ALTERACOES.md)** —
   o que mudou, por quê, impactos e como testar.
2. **Atualização do status** em [03-ROADMAP.md](03-ROADMAP.md) (se aplicável).
3. **README do pacote** atualizado (`packages/<pacote>/README.md`) quando a
   API ou o status mudar.
4. **ADR novo** em [02-DECISOES-TECNICAS.md](02-DECISOES-TECNICAS.md) quando
   a decisão for técnica, não óbvia e de médio/longo prazo.
5. Comentários **JSDoc em PT-BR** em funções públicas explicando o *porquê*
   (não apenas o *o quê*), especialmente em regras de simulação com
   referência ao GDD (ex.: `§104`).

## 5. Commits

Quando o repositório git for inicializado, seguir
[Conventional Commits](https://www.conventionalcommits.org/) em PT-BR:

```
feat(motor): adiciona ciclo base de simulação
fix(rng): corrige limites do nextInt
docs(roadmap): marca etapa 1 como concluída
test(motor): cobre estados de posse
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## 6. Regra de ouro

> Antes de escrever código, verificar no
> [GDD (`PROJETO.md`)](../PROJETO.md) se a funcionalidade existe.
> Se não existir e parecer necessária, **perguntar antes de assumir** —
> e registrar a decisão se avançar.

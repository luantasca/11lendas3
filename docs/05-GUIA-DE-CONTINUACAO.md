# 05 — Guia de Continuação

> Feito para quem (ou qualquer sessão futura) retomar o projeto do ponto
> exato em que parou, sem perder contexto.

## Checklist ao retomar

1. **Ler a ordem certa dos documentos:**
   1. Este guia (você está aqui).
   2. [`REGISTRO-DE-ALTERACOES.md`](REGISTRO-DE-ALTERACOES.md) — o que já foi
      feito e pendências abertas.
   3. [`03-ROADMAP.md`](03-ROADMAP.md) — status real das etapas.
   4. [`PROJETO.md`](../PROJETO.md) (GDD) — apenas as seções da etapa atual.
2. **Deixar o ambiente verde:**
   ```bash
   npm install
   npm test           # esperado: 25 testes passando
   npm run typecheck  # sem erros
   ```
3. **Escolher a próxima etapa** pelo roadmap (hoje: **etapa 3 do motor** —
   resolução de ações por atributos, GDD §54–55).
4. **Após cada tarefa:** atualizar registro, roadmap e README do pacote.

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala/atualiza dependências (raiz) |
| `npm test` | Testes de todos os workspaces |
| `npm run typecheck` | Verificação de tipos em todos os workspaces |
| `npm test -w @manager/match-engine` | Testes só do motor |
| `npm run test:watch -w @manager/match-engine` | Testes em modo observador |

## Estado conhecido do projeto (após sessão 2 — 2026-10-05)

**Funcionando:**
- Monorepo com npm workspaces, TypeScript strict e Vitest.
- Pacote `@manager/match-engine`:
  - etapa 1: RNG determinístico (`createRng`);
  - etapa 2: estado da partida e ciclo de simulação
    (`createMatchEngine` + `tick()`, imutável, com decaimento de condição);
  - 25 testes passando.

**Pendências abertas:**
- Upgrade do ambiente para Node 20 LTS ([ADR-006](02-DECISOES-TECNICAS.md)).
- Constantes de decaimento de condição são provisórias (ajuste por playtest).
- Próxima etapa: ações por atributos (GDD §54–55).

**Não existe ainda (não inventar ao ler o código):**
app web, banco de dados, autenticação, liga, draft, transferências,
interface de partida, WebSocket, transições de fase de posse, movimentação
da bola, eventos, estatísticas e xG.

## Regras permanentes da sessão

- Respostas e documentação em **Português (Brasil)**.
- Analisar todo o contexto antes de modificar arquivos.
- Nada de funcionalidade sem respaldo no GDD ou em ADR documentado.
- Ao terminar qualquer tarefa: informar arquivos alterados, motivo,
  impactos e como testar.

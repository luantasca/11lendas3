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
   npm test           # esperado: 53 testes passando
   npm run typecheck  # sem erros
   ```
3. **Escolher a próxima etapa** pelo roadmap (hoje: **etapa 4 do motor** —
   aleatoriedade controlada, GDD §56).
4. **Após cada tarefa:** atualizar registro, roadmap e README do pacote.

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala/atualiza dependências (raiz) |
| `npm test` | Testes de todos os workspaces |
| `npm run typecheck` | Verificação de tipos em todos os workspaces |
| `npm test -w @manager/match-engine` | Testes só do motor |
| `npm run test:watch -w @manager/match-engine` | Testes em modo observador |

## Estado conhecido do projeto (após sessão 4 — 2026-10-05)

**Funcionando:**
- Monorepo com npm workspaces, TypeScript strict e Vitest.
- Pacote `@manager/match-engine`:
  - etapa 1: RNG determinístico (`createRng`);
  - etapa 2: estado da partida e ciclo de simulação
    (`createMatchEngine` + `tick()`, imutável, com decaimento de condição);
  - etapa 3: ações por atributos (`calcPassChance`, `resolveDribble`,
    `resolveShot` etc. — funções independentes, ADR-009);
  - 53 testes passando.
- Repositório Git no GitHub com deploy key SSH (push funcional).

**Pendências abertas:**
- Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- Constantes de decaimento e de chance são provisórias (ajuste por playtest).
- Integração das ações ao ciclo da partida (exige posicionamento em campo).
- Próxima etapa: aleatoriedade controlada (GDD §56).

**Não existe ainda (não inventar ao ler o código):**
app web, banco de dados, autenticação, liga, draft, transferências,
interface de partida, WebSocket, transições de fase de posse, movimentação
da bola, eventos, estatísticas e xG — e as ações **ainda não rodam dentro
do ciclo** da partida (são funções independentes).

## Regras permanentes da sessão

- Respostas e documentação em **Português (Brasil)**.
- Analisar todo o contexto antes de modificar arquivos.
- Nada de funcionalidade sem respaldo no GDD ou em ADR documentado.
- Ao terminar qualquer tarefa: informar arquivos alterados, motivo,
  impactos e como testar.

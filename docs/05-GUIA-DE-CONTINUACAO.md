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
   npm test           # esperado: 85 testes passando
   npm run typecheck  # sem erros
   ```
3. **Escolher a próxima etapa** pelo roadmap (hoje: **integração de
   ações/eventos ao ciclo** e depois **etapa 7 — prova de conceito**,
   GDD §113–114).
4. **Após cada tarefa:** atualizar registro, roadmap e README do pacote.

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala/atualiza dependências (raiz) |
| `npm test` | Testes de todos os workspaces |
| `npm run typecheck` | Verificação de tipos em todos os workspaces |
| `npm test -w @manager/match-engine` | Testes só do motor |
| `npm run test:watch -w @manager/match-engine` | Testes em modo observador |

## Estado conhecido do projeto (após sessão 6 — 2026-10-05)

**Funcionando:**
- Monorepo com npm workspaces, TypeScript strict e Vitest.
- Pacote `@manager/match-engine`:
  - etapa 1: RNG determinístico (`createRng`);
  - etapa 2: estado da partida e ciclo de simulação (`createMatchEngine` +
    `tick()`, imutável, com decaimento de condição);
  - etapa 3: ações por atributos (`calcPassChance`, `resolveDribble`,
    `resolveShot` — funções independentes, ADR-009);
  - etapa 4: aleatoriedade controlada comprovada por testes
    estatísticos (§56, `tests/controlled-randomness.test.ts`);
  - etapa 5: eventos (`criarEvento`, §91), xG (`calcularXg`, §60) e
    estatísticas (`computeMatchStats`, §59) — ADR-010;
  - etapa 6: nota dos jogadores (`computePlayerRatings`, §61, escala
    1.0–10.0, pesos provisórios) — ADR-011;
  - 85 testes passando.
- Repositório Git no GitHub com deploy key SSH (push funcional).

**Pendências abertas:**
- Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- Constantes de decaimento e de chance são provisórias (ajuste por playtest).
- Integração de ações e eventos ao ciclo da partida (exige posicionamento
  em campo) — o ciclo ainda não gera eventos sozinho.
- Próximos passos: integração de ações/eventos ao ciclo → etapa 7
  (prova de conceito, GDD §113–114).

**Não existe ainda (não inventar ao ler o código):**
app web, banco de dados, autenticação, liga, draft, transferências,
interface de partida, WebSocket, transições de fase de posse, movimentação
da bola, narração, gols gerados pelo ciclo — eventos e estatísticas existem
como **módulos**, mas nada os alimenta automaticamente ainda.

## Regras permanentes da sessão

- Respostas e documentação em **Português (Brasil)**.
- Analisar todo o contexto antes de modificar arquivos.
- Nada de funcionalidade sem respaldo no GDD ou em ADR documentado.
- Ao terminar qualquer tarefa: informar arquivos alterados, motivo,
  impactos e como testar.

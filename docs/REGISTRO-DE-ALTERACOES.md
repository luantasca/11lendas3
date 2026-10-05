# Registro de Alterações

> Histórico cronológico do que foi feito, por quê, e como validar.
> **Toda sessão de trabalho relevante acrescenta uma entrada aqui.**
> Formato: mais recente no topo.

---

## 2026-10-05 — Sessão 4: Motor etapa 3 — ações por atributos

### O que foi feito

1. **`packages/match-engine/src/player.ts`** — ficha e atributos do
   jogador: `PlayerAttributes` com os 27 atributos do GDD §10 (Técnicos,
   Físicos, Mentais, Defensivos, Goleiros, escala 1–100), `Player` com
   pé dominante (§85) — mapeamento PT→EN documentado em comentários.
2. **`packages/match-engine/src/actions.ts`** — resolução das três ações
   da §55:
   - `calcPassChance(ctx)` — Passe/Visão/Decisão vs pressão, distância,
     posicionamento do receptor, entrosamento;
   - `calcDribbleChance(ctx)` — Drible/Agilidade/Aceleração/Decisão vs
     Desarme/Posicionamento/Agilidade do marcador;
   - `calcShotChance(ctx)` — Finalização/Composição/Posicionamento vs
     Reflexo/Posicionamento/1×1 do goleiro + pé dominante, ângulo,
     distância, pressão;
   - `resolvePass/Dribble/Shot(ctx, rng)` — sorteio do desfecho com o RNG
     da partida (§104, §56);
   - modificadores de estado: condição (§16), forma (§15),
     entrosamento (§17) — conforme fórmula conceitual da §57.
3. **28 novos testes** (total do pacote: 53): sensibilidade monotônica de
   cada variável, clamps de sanidade, determinismo do sorteio, sanidade
   estatística do favorito (§56) e validações em PT-BR.
4. **Documentação atualizada**: ADR-009, roadmap (etapa 3 ✅), READMEs,
   guia de continuação e árvore de arquitetura.

### Motivo

Pedido direto: "Fazer a etapa 3 completa de uma vez: atributos + passe +
drible + finalização" — próximo item do roadmap (prioridade §113).

### Premissas e limitações (não definidas no GDD)

| Item | Valor adotado | Observação |
|------|---------------|------------|
| Fórmula | `clamp(base + pontos × 0.01)` | GDD §57 dá só o conceito — modelo fechado no ADR-009. |
| Bases de chance | passe 0.50 / drible 0.50 / finalização 0.30 | **Provisórias**; calibrar com xG (§60) na etapa 5. |
| Constantes (distância, ângulo, pé, pressão, condição, forma, entrosamento) | ver tabela do ADR-009 / comentários em `actions.ts` | **Provisórias de equilíbrio** — ajustar por playtest. |
| "Situação tática" (§57) | não modelada | Entra na integração das ações ao ciclo (futura). |
| Ações no ciclo | não integradas | São funções independentes; integração exige posicionamento em campo. |

### Arquivos criados/modificados

| Arquivo | Motivo |
|---------|--------|
| `packages/match-engine/src/player.ts` | Atributos §10/§85–86 |
| `packages/match-engine/src/actions.ts` | Chance + resolução das ações §55/§57 |
| `packages/match-engine/src/index.ts` | Exportar nova API pública |
| `packages/match-engine/tests/actions.test.ts` | 28 testes da etapa 3 |
| `packages/match-engine/README.md` | Status + API das ações |
| `docs/02-DECISOES-TECNICAS.md` | ADR-009 (modelo de chance) |
| `docs/03-ROADMAP.md` | Etapa 3 ✅ + obs. sobre integração |
| `docs/01-ARQUITETURA.md` | Árvore de diretórios |
| `docs/05-GUIA-DE-CONTINUACAO.md` | Estado conhecido atualizado |
| `README.md` | Tabela de status |

### Impactos

- API de ações é a base da resolução de jogadas — mas **ainda não afeta
  a partida** (não integrada ao `tick()`).
- Balanceamento atual NÃO representa futebol real (taxas de gol altas) —
  calibração prevista nas etapas 4–5.

### Como testar

```bash
npm test           # esperado: 53 testes passando
npm run typecheck  # esperado: sem erros
```

### Pendências abertas

- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- [ ] Constantes provisórias: decaimento e ações (ajuste por playtest).
- [ ] Integração das ações ao ciclo da partida (posicionamento em campo).
- [ ] Próxima etapa: aleatoriedade controlada (GDD §56).

---

## 2026-10-05 — Sessão 3: Inicialização do repositório Git

### O que foi feito

1. **Repositório Git inicializado** (branch `main`) e conectado ao GitHub:
   <https://github.com/luantasca/11lendas3>.
2. **Identidade de commit (configuração local do repositório):**
   `luantasca <luantasca@gmail.com>`.
3. **Primeiro commit** com todo o conteúdo das sessões 1 e 2
   (documentação + monorepo + motor etapas 1–2).
4. Documentação atualizada: pendência de git marcada como concluída no
   README raiz, roadmap e guia de continuação.
5. **Autenticação SSH configurada**: par de chaves ed25519 gerado no
   ambiente (`~/.ssh/id_ed25519_11lendas3`); a chave pública **v2** foi
   cadastrada como **Deploy Key com write access** no repositório. Remote
   trocado para `git@github.com:luantasca/11lendas3.git` e `known_hosts`
   do GitHub verificado contra a API oficial (fingerprint
   `SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU`).
   Nota: a chave v1 foi recusada pelo GitHub ("chave já em uso" +
   `Permission denied`) e descartada; a v2 autenticou com sucesso.
6. **Push concluído**: branch `main` enviada ao GitHub (commit `644a7d5`).

### Motivo

Proteger o trabalho realizado e viabilizar a continuação segura
(ponto de retorno por sessão), conforme recomendado ao final da sessão 2.

### Impactos

- Todo commit futuro passa a ter histórico versionado.
- `node_modules/`, builds e logs seguem ignorados pelo `.gitignore`.

### Como verificar

```bash
git log --oneline   # deve mostrar o primeiro commit
git remote -v       # origin -> git@github.com:luantasca/11lendas3.git
git status          # deve mostrar working tree limpa
git ls-remote --heads origin  # main deve apontar para o mesmo commit
```

### Pendências abertas

- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- [ ] Ajustar constantes de decaimento por playtest (valores provisórios).
- [x] Próxima etapa do motor: ações por atributos (concluída na sessão 4 — etapa 3 do roadmap).

---

## 2026-10-05 — Sessão 2: Motor etapa 2 — estado e ciclo de simulação

### O que foi feito

1. **`packages/match-engine/src/match-state.ts`** — tipos e constantes do
   estado da partida: `MatchState` (relógio, placar, posse, fase da posse
   §53, bola, condição §16, status), `MatchConfig` (seed, clubes,
   escalações, ritmo §47, pressão §48) e `MATCH_DURATION_SECONDS = 5400`.
2. **`packages/match-engine/src/engine.ts`** — `createMatchEngine(config)`:
   - `tick()` avança 1 ciclo = 1 segundo (§52) e devolve novo estado
     imutável;
   - atualiza a condição física de todos os jogadores por ciclo, com
     decaimento influenciado por ritmo (§47) e pressão (§48), com piso em 0;
   - encerra a partida em 90 min (`status: "ENCERRADA"`);
   - valida configurações inválidas com mensagens em PT-BR;
   - cria o RNG da `match_seed` (§104) exposto em `engine.rng`.
3. **17 novos testes** (total do pacote: 25) cobrindo relógio, imutabilidade,
   encerramento, decaimento (ritmo/pressão), piso em 0, determinismo e
   validações.
4. **Documentação atualizada**: README do pacote, roadmap (etapa 2 ✅),
   ADR-008, guia de continuação, arquitetura e README raiz.

### Motivo

Continuar o roadmap acordado (prioridade nº 1 do GDD §113) após a sessão 1,
com testes desde o início.

### Premissas assumidas (não definidas explicitamente no GDD)

| Premissa | Valor | Justificativa |
|----------|-------|---------------|
| Duração da partida | 5400 s (90 min) | Padrão de futebol; §67 cita minutos 70/80. Ajustável. |
| Decaimento de condição | ritmo: 0,003/0,004/0,006 por s; pressão: +0/0,0005/0,001 por s | §47–48 exigem relação, mas não dão constantes. **Provisórios de equilíbrio.** |
| Fase inicial da posse | `CONSTRUCAO` | Transições reais só na etapa 3. |
| Campo 2D | normalizado 0–100 (x e y) | §40 não define coordenadas; escolha provisória. |
| Posse inicial | clube da casa | Convenção de início de partida. |

### Arquivos criados/modificados

| Arquivo | Motivo |
|---------|--------|
| `packages/match-engine/src/match-state.ts` | Tipos/constantes do estado (§52, §53, §16, §89) |
| `packages/match-engine/src/engine.ts` | Ciclo de simulação e decaimento (§47, §48, §52) |
| `packages/match-engine/src/index.ts` | Exportar nova API pública |
| `packages/match-engine/tests/engine.test.ts` | 17 testes da etapa 2 |
| `packages/match-engine/README.md` | Status + API da etapa 2 |
| `docs/02-DECISOES-TECNICAS.md` | ADR-008 (design do motor) |
| `docs/03-ROADMAP.md` | Marcar etapa 2 ✅ e apontar etapa 3 |
| `docs/01-ARQUITETURA.md` | Árvore de diretórios atualizada |
| `docs/05-GUIA-DE-CONTINUACAO.md` | Estado conhecido atualizado |
| `README.md` | Tabela de status atualizada |

### Impactos

- A API `createMatchEngine`/`tick` é a base sobre a qual as etapas 3–7
  serão construídas — mudanças futuras devem preservar determinismo e
  imutabilidade (ADR-008).
- Nenhuma interface ou partida jogável existe ainda.
- Transições de fase, movimentação da bola, eventos e estatísticas
  **ainda não existem** (etapas 3 e 5).

### Como testar

```bash
npm test           # esperado: 25 testes passando
npm run typecheck  # esperado: sem erros
```

### Pendências abertas

- [x] Inicializar repositório git (concluído na sessão 3 — ver entrada no topo).
- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- [ ] Ajustar constantes de decaimento por playtest (valores provisórios).
- [x] Próxima etapa: ações por atributos (concluída na sessão 4 — etapa 3 do roadmap).

---

## 2026-10-05 — Sessão 1: Fundação do projeto

### O que foi feito

1. **Fundação documental criada** (`docs/`): arquitetura, ADRs (001–007),
   roadmap baseado no GDD, convenções, guia de continuação e este registro.
2. **Monorepo inicializado** com npm workspaces + TypeScript strict +
   Vitest (compatível com o Node 16 do ambiente).
3. **Pacote `@manager/match-engine` criado — etapa 1 do motor:**
   RNG determinístico `mulberry32` com API `createRng(seed)` →
   `next()`, `nextInt(max)`, `seed`, documentado em PT-BR.
4. **8 testes criados e passando**, incluindo trava de regressão com
   valores golden da seed 42 (protege a reprodução de partidas — GDD §104).

### Motivo

Pedido inicial: começar o projeto com **tudo documentado para continuação
segura**, priorizando conforme GDD §113 (validar o motor primeiro) com
**testes desde o início**.

### Decisões técnicas tomadas

| Decisão | ADR |
|---------|-----|
| Monorepo com npm workspaces | [ADR-001](02-DECISOES-TECNICAS.md) |
| TypeScript strict | [ADR-002](02-DECISOES-TECNICAS.md) |
| Stack simplificada (sem Redis/DB agora) | [ADR-003](02-DECISOES-TECNICAS.md) |
| Vitest 0.34.6 (compatível com Node 16) | [ADR-004](02-DECISOES-TECNICAS.md) |
| RNG mulberry32 + proibição de `Math.random()` | [ADR-005](02-DECISOES-TECNICAS.md) |
| Comentários/docs em PT-BR, identificadores em inglês | [ADR-007](02-DECISOES-TECNICAS.md) |

### Arquivos criados/modificados

| Arquivo | Motivo |
|---------|--------|
| `README.md` | Visão geral técnica + status real do projeto |
| `.gitignore` | Ignorar node_modules, build, coverage e afins |
| `package.json` | Raiz do monorepo (workspaces + scripts globais) |
| `tsconfig.base.json` | Base TypeScript strict compartilhada |
| `docs/README.md` | Índice da documentação |
| `docs/01-ARQUITETURA.md` | Arquitetura técnica e princípios do GDD |
| `docs/02-DECISOES-TECNICAS.md` | ADR-001 a ADR-007 |
| `docs/03-ROADMAP.md` | Etapas do motor + MVP com status real |
| `docs/04-CONVENCOES.md` | Padrões de código, testes e documentação |
| `docs/05-GUIA-DE-CONTINUACAO.md` | Checklist de retomada |
| `docs/REGISTRO-DE-ALTERACOES.md` | Este arquivo |
| `packages/match-engine/*` | Pacote do motor: RNG + testes + README |

### Impactos

- Nenhum comportamento de jogo existe ainda — apenas base e etapa 1 do motor.
- `npm test` e `npm run typecheck` na raiz validam todo o projeto.

### Como testar

```bash
npm install
npm test           # esperado: 8 testes passando
npm run typecheck  # esperado: sem erros
```

### Bug corrigido durante a sessão

- **Sintoma:** teste golden falhava.
- **Causa raiz:** os valores de referência foram gerados com `toFixed(16)`,
  que arredonda para 16 casas decimais — dois valores perderam o 17º dígito
  significativo. O RNG estava correto; o teste estava com valores errados.
- **Correção:** valores golden regenerados com precisão total do JS
  (`0.44829055899754167`, `0.17481389874592423`).

### Pendências abertas

- [x] Inicializar repositório git (concluído na sessão 3 — ver entrada no topo).
- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x ([ADR-006](02-DECISOES-TECNICAS.md)).
- [x] Próxima etapa: motor — estado da partida e ciclos (concluída na sessão 2 — etapa 2 do roadmap).

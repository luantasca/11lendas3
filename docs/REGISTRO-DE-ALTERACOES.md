# Registro de Alterações

> Histórico cronológico do que foi feito, por quê, e como validar.
> **Toda sessão de trabalho relevante acrescenta uma entrada aqui.**
> Formato: mais recente no topo.

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
5. **`git push` PENDENTE** — o ambiente não possui credenciais do GitHub
   (sem `gh`, sem chaves SSH, sem credential helper). Após autenticar,
   basta executar `git push -u origin main`.

### Motivo

Proteger o trabalho realizado e viabilizar a continuação segura
(ponto de retorno por sessão), conforme recomendado ao final da sessão 2.

### Impactos

- Todo commit futuro passa a ter histórico versionado.
- `node_modules/`, builds e logs seguem ignorados pelo `.gitignore`.

### Como verificar

```bash
git log --oneline   # deve mostrar o primeiro commit
git remote -v       # origin -> https://github.com/luantasca/11lendas3.git
git status          # deve mostrar working tree limpa
```

### Pendências abertas

- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- [ ] Ajustar constantes de decaimento por playtest (valores provisórios).
- [ ] Próxima etapa do motor: ações por atributos (GDD §54–55).

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

- [ ] Inicializar repositório git (aguardando pedido/autorização).
- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x (ADR-006).
- [ ] Ajustar constantes de decaimento por playtest (valores provisórios).
- [ ] Próxima etapa: ações por atributos (GDD §54–55).

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

- [ ] Inicializar repositório git (não feito — requer pedido/autorização).
- [ ] Upgrade do ambiente para Node 20 LTS e Vitest ≥ 1.x ([ADR-006](02-DECISOES-TECNICAS.md)).
- [ ] Próxima etapa: motor — estado da partida e ciclos (GDD §52–53).

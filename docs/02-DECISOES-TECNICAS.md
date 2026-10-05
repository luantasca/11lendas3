# 02 — Decisões Técnicas (ADRs)

> Registro de decisões de arquitetura e ferramentas. Cada decisão tem
> **Contexto / Decisão / Consequências**. Decisões reversíveis são anotadas
> aqui; decisões estruturais grandes ganham um ADR numerado próprio.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| 001 | Monorepo com npm workspaces | ✅ Aceita |
| 002 | TypeScript em modo strict | ✅ Aceita |
| 003 | Stack simplificada para o MVP | ✅ Aceita |
| 004 | Vitest como executor de testes | ✅ Aceita |
| 005 | RNG determinístico (mulberry32) e proibição de `Math.random()` | ✅ Aceita |
| 006 | Limitação do ambiente: Node 16 (recomendado: 20 LTS) | ⚠️ Pendente de upgrade |
| 007 | Idioma: código em inglês, documentação em PT-BR | ✅ Aceita |
| 008 | Motor por ciclos com estado imutável e RNG interno | ✅ Aceita |
| 009 | Modelo de chance por duelo para resolução de ações | ✅ Aceita |
| 010 | Modelo de eventos, estatísticas e xG | ✅ Aceita |
| 011 | Modelo de nota dos jogadores (rating) | ✅ Aceita |
| 012 | Integração do ciclo: simulação por fases da posse | ✅ Aceita |

---

## ADR-001 — Monorepo com npm workspaces

**Contexto:** o projeto terá múltiplas partes independentes (motor, app web,
compartilhados de tipos/ferramentas). Precisa de separação sem complexidade
extra de infraestrutura.

**Decisão:** usar **npm workspaces** (recurso nativo do npm ≥ 8), com pacotes
em `packages/*`.

**Consequências:**
- ✅ Zero dependências extras de ferramenta (Nx, Turborepo, Lerna).
- ✅ Um único `npm install` na raiz instala tudo.
- ⚠️ Scripts precisam ser propagados manualmente via `--workspaces`
  (já resolvido nos scripts `test` e `typecheck` da raiz).

---

## ADR-002 — TypeScript em modo strict

**Contexto:** o motor de partidas terá muitas regras numéricas e de estado;
erros de tipo em simulações são difíceis de detectar em runtime.

**Decisão:** TypeScript com `"strict": true` e `noUncheckedIndexedAccess`
em `tsconfig.base.json`, herdado por todos os pacotes.

**Consequências:**
- ✅ Mais segurança em cálculos e estruturas de estado do motor.
- ✅ Autocomplete/documentação automática do código.
- ⚠️ Mais rigidez no início do desenvolvimento (considerado aceitável).

---

## ADR-003 — Stack simplificada para o MVP

**Contexto:** o GDD (§102) sugere Next.js + Node + PostgreSQL + Redis +
WebSocket. Infraestrutura pesada cedo demais atrasa a validação do motor
(prioridade §113).

**Decisão:** começar apenas com **TypeScript + Vitest**. Banco de dados,
cache (Redis) e WebSocket serão adicionados **quando houver necessidade real**,
cada um gerando seu próprio ADR.

**Consequências:**
- ✅ Validação rápida do motor sem subir infraestrutura.
- ✅ Menos manutenção e dependências agora.
- ⚠️ Multiplayer real (tempo real, persistência) fica para etapa posterior —
  já previsto no roadmap do GDD.

---

## ADR-004 — Vitest como executor de testes

**Contexto:** o projeto exige testes desde o primeiro ciclo (decisão do
início do projeto). O ambiente tem Node 16, que não é compatível com
Vitest ≥ 1.0 (exige Node ≥ 18).

**Decisão:** usar **Vitest 0.34.6** (última versão compatível com Node 16),
com importação explícita de `describe/it/expect` (sem globals).

**Consequências:**
- ✅ Testes em TypeScript sem etapa de compilação.
- ⚠️ Versão fixada abaixo da atual — **subir para Vitest ≥ 1.x junto com o
  upgrade de Node (ADR-006)**.

---

## ADR-005 — RNG determinístico (mulberry32) e proibição de `Math.random()`

**Contexto:** o GDD (§104) exige que a mesma `match_seed` reproduza a mesma
partida exatamente (debug, suporte, investigação de bugs).

**Decisão:**
1. Todo sorteio do motor usa `createRng(seed)` (algoritmo **mulberry32**,
   32 bits de estado, rápido e com boa qualidade para simulação).
2. **`Math.random()` é proibido** dentro de `packages/match-engine`.
3. Os valores de referência ("golden") da seed 42 estão fixados em
   `tests/rng.test.ts` — alterar o algoritmo quebra esses testes de propósito,
   forçando revisão documentada.

**Consequências:**
- ✅ Reprodução total de partidas antigas.
- ⚠️ Trocar o algoritmo no futuro invalida reprodução de partidas antigas
  (só fazer com ADR novo).

---

## ADR-006 — Limitação do ambiente: Node 16

**Contexto:** o ambiente disponível hoje tem **Node v16.20.2**, que está em
fim de vida (EOL). Ferramentas modernas (Vitest ≥ 1, ESLint 9, Next 15)
exigem Node 18+.

**Decisão:** por enquanto, manter compatibilidade com Node ≥ 16.17 e fixar
versões de ferramentas compatíveis (ADR-004). **Recomendação:** migrar o
ambiente para **Node 20 LTS** antes de avançar para a etapa de app web.

**Consequências:**
- ✅ Projeto funciona hoje sem bloqueio.
- ⚠️ Pendência registrada em [REGISTRO-DE-ALTERACOES.md](REGISTRO-DE-ALTERACOES.md):
  ao upgrade, atualizar `engines`, Vitest e esta ADR.

---

## ADR-007 — Idioma: código em inglês, documentação em PT-BR

**Contexto:** as regras do projeto exigem respostas, explicações e
documentação em Português (Brasil), sem exigir o idioma dos identificadores.

**Decisão:**
- **Identificadores e nomes de arquivo de código:** inglês (padrão da
  comunidade — ex.: `createRng`, `tests/rng.test.ts`).
- **Comentários no código, mensagens de erro, testes e toda documentação:**
  Português (Brasil).

**Consequências:**
- ✅ Compatível com ferramentas e futuros colaboradores internacionais.
- ✅ Documentação acessível ao time do projeto.

---

## ADR-008 — Motor por ciclos com estado imutável e RNG interno

**Contexto:** GDD §52 define que o motor funciona por ciclos (1 ciclo =
1 segundo) atualizando posição, condição, posse e eventos. O GDD §104 exige
reprodução exata de partidas por seed. A etapa 2 precisava de uma base
estável para as etapas futuras (ações, eventos, replay §108).

**Decisão:**
1. API imperativa: `createMatchEngine(config)` → objeto com `state`
   (atual), `rng` (da partida) e `tick()` (avança 1 ciclo e devolve o novo
   estado).
2. **Estado imutável**: cada `tick()` gera um novo objeto `MatchState`;
   nada é modificado no estado anterior (facilita replay §108 e testes).
3. O **RNG nasce da `match_seed`** dentro do engine e fica disponível em
   `engine.rng` — as etapas futuras (ações) usam esse mesmo RNG, garantindo
   reprodução integral da partida.
4. Premissas assumidas e documentadas: duração de 5400 s (90 min),
   constantes de decaimento de condição **provisórias** (ritmo §47 /
   pressão §48), fase inicial `CONSTRUCAO`, campo 2D normalizado 0–100.

**Consequências:**
- ✅ Testes simples: mesma configuração → mesma sequência de estados.
- ✅ Base pronta para replay/debug (GDD §108).
- ⚠️ Constantes de equilíbrio precisarão de ajuste por playtest — qualquer
  mudança deve ser registrada no registro de alterações.

---

## ADR-009 — Modelo de chance por duelo para resolução de ações

**Contexto:** GDD §55 define quais atributos participam de cada ação
(passe, drible, finalização) e §57 dá uma fórmula conceitual, mas o GDD
**não informa constantes nem fórmula fechada**. A etapa 3 precisava de um
modelo simples, testável e ajustável.

**Decisão:**
1. Cada ação vira uma função pura `calc*Chance(context)` → número em
   `[0, 1]`, e um `resolve*(context, rng)` que sorteia o desfecho com o
   RNG determinístico da partida (§104).
2. Modelo: `chance = clamp(base + pontos × 0.01)`, onde `pontos` combina
   **qualidade técnica + mental** (médias ponderadas dos atributos do §55)
   **− defesa adversária** (pressão/desarme/goleiro) **+ modificadores de
   estado** (condição §16, forma §15, entrosamento §17) e ajustes
   situacionais (distância, ângulo, pé dominante).
3. Bases: passe 0.50, drible 0.50, finalização 0.30 (chute real converge
   para taxa menor; calibrar com xG na etapa 5, §60).
4. **Todas as constantes são provisórias de equilíbrio** — documentadas em
   `src/actions.ts` e sujeitas a ajuste por playtest.
5. "Situação tática" (§57) ainda não entra no cálculo — a integração das
   ações ao ciclo da partida vem na preparação da prova de conceito.

**Consequências:**
- ✅ Fórmula única e simples de entender/ajustar; cada variável tem teste
  próprio (sensibilidade monotônica).
- ✅ Sorteio já usa o RNG da seed — reprodução integral garantida.
- ⚠️ Balanceamento real (taxas de gol/passe parecidas com futebol) só
  acontece nas etapas 4–5; não julgar equilíbrio pelos valores atuais.

---

## ADR-010 — Modelo de eventos, estatísticas e xG

**Contexto:** GDD §91 define a tabela `match_events` com tipos de eventos;
§59 lista as estatísticas que o técnico vê; §60 define xG com 4 exemplos.
A etapa 5 precisava de representação em memória, compatível com o futuro
banco (§84–101) e com a narração/replay (§42, §108).

**Decisão:**
1. **Eventos em memória** (`MatchEvent`) com os campos da §91
   (`game_second`, `type`, `club_id`, `player_id`, `secondary_player_id`,
   `metadata`). **Sem `id`/`match_id`**: são da camada de persistência.
2. **Tipos estendidos**: além dos 9 tipos da §91, `TACKLE` e `CORNER`
   existem porque a §59 exige desarmes e escanteios, que a lista original
   não cobre.
3. **Contrato de metadata**: `SHOT { xg, noGol }`, `PASS { sucesso }`,
   `CARD { cor }` — demais chaves livres (metadata_json).
4. **xG**: função `calcularXg(tipo)` com a tabela exata da §60
   (0.05 / 0.12 / 0.42 / 0.76). Modelagem contínua por distância/ângulo é
   calibração futura.
5. **`computeMatchStats(events, posse)`**: função pura que agrega a §59;
   posse vem da linha do tempo dos ciclos (§52), não de eventos; sem
   passes, precisão = 0; eventos de clubes desconhecidos são ignorados.

**Consequências:**
- ✅ Mesmos eventos → mesmas estatísticas (determinismo/ replay §108).
- ✅ Camada de banco futura mapeia direto para a tabela da §91.
- ⚠️ O ciclo ainda não gera eventos automaticamente — integração pendente
  (ver roadmap); estatísticas só existem quando há eventos para agregar.

---

## ADR-011 — Modelo de nota dos jogadores (rating)

**Contexto:** GDD §61 define nota inicial 6.0, escala 1.0–10.0 e que
"ações positivas aumentam, negativas diminuem" — mas **não informa
quanto** cada ação vale. §92 tem o campo `rating`.

**Decisão:**
1. `getRatingContributions(evento)` converte eventos (etapa 5) em deltas;
   `computePlayerRatings(events, playerIds?)` soma tudo a partir de 6.0 e
   **limita à escala 1.0–10.0** — função pura e determinística.
2. **Tabela de pesos PROVISÓRIA** (ajustar por playtest): Gol +0.4,
   Assistência +0.2, Defesa +0.015, Passe completo +0.002, Desarme +0.001;
   Passe falho −0.002, Chute fora −0.05, Falta/Impedimento −0.02,
   Cartão amarelo −0.1, Cartão vermelho −0.5, Chute defendido −0.004.
   **Recalibrados na sessão 7**: medido em partida real (~5.700 eventos),
   os pesos originais saturavam o teto 10.0 em todos os jogadores e
   anulavam a discriminação da §61.
3. **Contratos de atribuição**: GOAL → `playerId` = marcador,
   `secondaryPlayerId` = assistidor; SAVE → `playerId` = goleiro,
   `secondaryPlayerId` = finalizador.
4. **Limitação**: sem penalização de gol sofrido para a defesa — os
   eventos não identificam quem errou (documentado, não inventado).
5. Jogador sem ações relevantes fica com a nota inicial 6.0.

**Consequências:**
- ✅ Simples, testável e determinístico; `reason` em PT-BR já prepara a
  narração futura (§42).
- ⚠️ Pesos provisórios — a nota "real" calibra por playtest; rating por
  minuto evolui junto com a integração ao ciclo.

---

## ADR-012 — Integração do ciclo: simulação por fases da posse

**Contexto:** etapas 3–6 produziram funções independentes (ações, eventos,
estatísticas, notas), mas o `tick()` só movia relógio e condição — nada
alimentava os módulos. GDD §52–§55 descrevem o ciclo com posse, ações e
eventos; §113 exige motor jogável antes da interface.

**Decisão:**
1. **Máquina de fases da posse** (§53): DEFESA → CONSTRUÇÃO → MEIO-CAMPO
   → ATAQUE → ÚLTIMO TERÇO → CHANCE → FINALIZAÇÃO. Sucesso na ação avança
   a fase; fracasso = perda de posse (+ evento TACKLE do defensor).
2. **1 ação por ciclo** (1 s): 70% passe / 30% drible (**provisório**);
   pressão adversária mapeada por fase (tabela provisória, crescente
   perto do gol).
3. **Finalização** (a partir de FINALIZAÇÃO): chute com xG pela tabela da
   §60 (distância define fora-da-área/cara-a-cara), ângulo e distância
   derivados da bola; gol ou defesa do goleiro; reposição no centro.
4. **Elencos na config**: `homePlayers`/`awayPlayers: Player[]` (mínimo 3)
   — **quebra de API** dos antigos `homePlayerIds` (atributos são
   necessários para resolver ações).
5. **Estado ganhou**: `events[]`, `home/awayPossessionSeconds` e
   `lastPasserId` (assistência, contrato ADR-011).

**Simplificações documentadas (não inventadas em silêncio):**
- Sem faltas, cartões, escanteios, impedimentos e substituições —
  exigem regras de descontinuidade (etapa 7).
- Chute registrado sempre no gol (`noGol: true`) — sem "fora".
- Goleiro/comparsas escolhidos por atributos (sem posições — §87 futuro).
- Entrosamento neutro (50) e forma 0 — não rastreados ainda (§17, §15).
- Balanceamento: partida real mede ~20 gols — calibração pendente.

**Consequências:**
- ✅ Partida completa gera eventos → estatísticas (§59) e notas (§61)
  funcionam de verdade; determinismo preservado (mesma seed = mesma
  partida, teste dedicado).
- ✅ Base direta para a prova de conceito (etapa 7) e replay (§108).
- ⚠️ Balanceamento e regras de descontinuidade são trabalho próximo
  registrado no roadmap/registro.

---

## Como criar uma nova ADR

1. Copiar o formato **Contexto / Decisão / Consequências**.
2. Incrementar a numeração (`ADR-008`, `009`...).
3. Adicionar ao índice acima.
4. Registrar a criação em [REGISTRO-DE-ALTERACOES.md](REGISTRO-DE-ALTERACOES.md).

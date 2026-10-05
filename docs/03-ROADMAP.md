# 03 — Roadmap

> Ordem de desenvolvimento baseada no GDD (§109–113). Status real — nada é
> marcado como concluído sem ter sido implementado e testado.

## Prioridade nº 1 (GDD §113): validar o motor de partidas

> "Antes de criar dezenas de recursos administrativos, deve ser validado o
> MOTOR DE PARTIDAS."

### Motor de partidas — etapas

| Etapa | Conteúdo | Origem no GDD | Status |
|-------|----------|---------------|--------|
| 1 | RNG determinístico com seed | §104 | ✅ Concluída (2026-10-05) |
| 2 | Estado da partida e ciclo de simulação (1 ciclo = 1s) | §52, §53 | ✅ Concluída (2026-10-05) |
| 3 | Resolução de ações por atributos (passe, drible, finalização) | §54, §55, §57 | ✅ Concluída (2026-10-05) |
| 4 | Aleatoriedade controlada embutida nas ações | §56 | ⬜ Não iniciada |
| 5 | Eventos, estatísticas e xG | §59, §60, §91 | ⬜ Não iniciada |
| 6 | Nota dos jogadores | §61 | ⬜ Não iniciada |
| 7 | Prova de conceito: Time A × Time B, campo 2D + narração, alterações táticas e substituições | §113, §114 | ⬜ Não iniciada |

> **Próxima:** etapa 4 — aleatoriedade controlada (§56).
>
> Obs.: as ações da etapa 3 são funções independentes e **ainda não estão
> integradas ao ciclo da partida** (etapa 2) — a integração exige
> posicionamento em campo e acontece na preparação da prova de conceito (§113).

> Critério da prova de conceito (§114): responder
> **"É divertido assistir e comandar uma partida?"** — sem mercado, estádio,
> dinheiro, liga completa ou draft nesta fase.

### Proibido nesta fase (GDD §114)

Mercado, estádio, dinheiro, liga completa e draft — só após validação do motor.

---

## MVP — Versão 1 (GDD §109)

Escopo completo da primeira versão jogável. Só iniciar após a prova de
conceito do motor.

| Módulo | Itens | Status |
|--------|-------|--------|
| Usuários | Cadastro, login | ⬜ |
| Liga | Criar liga, entrar em liga | ⬜ |
| Clube | Criar clube (Presidente + Técnico) | ⬜ |
| Jogadores | Base, atributos, overall, posições | ⬜ |
| Draft | Sala, picks, elencos | ⬜ |
| Técnico | Escalação, formação, táticas básicas | ⬜ |
| Partidas | Engine, campo 2D, narração, alterações táticas, substituições | ⬜ (etapa 1 do motor ✅) |
| Competições | Liga, tabela, resultados | ⬜ |

## Versões futuras (resumo — GDD §110–112)

- **V2:** Copa, finanças, bilheteria, público, transferências, janela, estatísticas.
- **V3:** Moral, forma, lesões, entrosamento, rivalidades, notícias, recordes.
- **V4:** Evolução, potencial, base, estádio, patrocínios, treinamentos.

---

## Infraestrutura (necessária antes do MVP completo)

| Item | Status | Observação |
|------|--------|------------|
| Monorepo + TypeScript + testes | ✅ | Ver [ADR-001](02-DECISOES-TECNICAS.md), [ADR-002](02-DECISOES-TECNICAS.md) |
| Repositório git inicializado | ✅ | [github.com/luantasca/11lendas3](https://github.com/luantasca/11lendas3) |
| Upgrade para Node 20 LTS | ⬜ | Ver [ADR-006](02-DECISOES-TECNICAS.md) |
| App web (GDD §102 sugere Next.js) | ⬜ | Definir em ADR ao iniciar |
| Banco de dados (GDD §84–101 modela as entidades) | ⬜ | Definir em ADR ao iniciar |
| WebSocket para tempo real (GDD §106) | ⬜ | Definir em ADR ao iniciar |

## Como atualizar este roadmap

1. Ao concluir uma etapa: marcar ✅ com a data e registrar em
   [REGISTRO-DE-ALTERACOES.md](REGISTRO-DE-ALTERACOES.md).
2. Ao descobrir uma nova etapa necessária: inserir na tabela correspondente
   **com a referência do GDD** (seção de onde veio a exigência).
3. Nunca pular etapas da prioridade nº 1 sem registrar a decisão.

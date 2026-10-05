# GAME DESIGN DOCUMENT — GDD

## Manager de Futebol Online em Dupla

**Versão:** 0.2  
**Plataforma inicial:** Web/Desktop e Mobile Responsivo  
**Modelo:** Multiplayer Online  
**Gênero:** Gestão esportiva / Estratégia / Simulação  
**Referências:** Football Manager, Championship Manager 01/02, Fantasy Football, Draft NBA/NFL

---

# 1. CONCEITO DO JOGO

O jogo será um manager de futebol online competitivo onde cada clube é administrado por **dois jogadores humanos**.

Cada dupla será formada por:

### PRESIDENTE

Responsável pela gestão administrativa e financeira.

### TÉCNICO

Responsável pela gestão esportiva e pelas partidas.

Cada dupla cria um clube próprio e compete contra outros clubes criados pelos jogadores.

O jogo terá temporadas, draft, liga, copa, mercado de transferências, economia própria, público nos estádios, estatísticas históricas e partidas acompanhadas em tempo real.

O objetivo principal não é reproduzir toda a complexidade do Football Manager.

O objetivo é criar:

**profundidade estratégica sem excesso de burocracia.**

O jogador deve aprender rapidamente como o jogo funciona, mas levar várias temporadas para dominar suas estratégias.

---

# 2. PRINCIPAL DIFERENCIAL

O principal diferencial será a divisão da administração do clube entre duas pessoas.

## Presidente

Pensa principalmente em:

- dinheiro;
- negociações;
- mercado;
- estádio;
- receitas;
- planejamento de longo prazo.

## Técnico

Pensa principalmente em:

- escalação;
- formação;
- tática;
- jogadores;
- adversário;
- desempenho durante a partida.

Isso deverá gerar conversas naturais entre os jogadores.

Exemplo:

Técnico:

“Preciso de um volante melhor.”

Presidente:

“Tenho somente $18 milhões disponíveis.”

---

Ou:

Presidente:

“Recebi $35 milhões pelo nosso atacante.”

Técnico:

“Não venda. Ele é fundamental para meu esquema.”

Essa interação deverá ser uma parte central da experiência.

---

# 3. FILOSOFIA DE DESIGN

O jogo deverá seguir cinco princípios.

## 3.1 Fácil de entender

Informações importantes serão apresentadas de maneira simples.

Exemplo:

OVR 84  
Forma: Boa  
Condição: 92%

---

## 3.2 Difícil de dominar

Apesar da interface simples, haverá profundidade através de:

- táticas;
- atributos;
- posições;
- mercado;
- economia;
- entrosamento;
- administração do elenco.

---

## 3.3 Multiplayer e social

Grande parte da diversão deverá vir da interação entre jogadores.

Especialmente:

- negociação;
- draft;
- rivalidades;
- decisões presidente/técnico.

---

## 3.4 Temporadas relativamente rápidas

Uma temporada não deverá durar meses.

Objetivo inicial:

**4 a 8 semanas por temporada.**

---

## 3.5 O Overall não decide sozinho

Este será um princípio central do motor do jogo.

O OVR será uma representação rápida da qualidade do jogador.

Porém:

**o jogo nunca deverá simplesmente comparar o Overall dos jogadores para decidir uma jogada ou partida.**

O motor deverá considerar:

- atributos individuais;
- posição;
- função;
- formação;
- tática;
- condição física;
- moral;
- forma;
- entrosamento;
- adversário;
- situação da partida;
- aleatoriedade controlada.

Isso significa que:

Um jogador OVR 79 corretamente utilizado pode jogar melhor que um OVR 84 utilizado de maneira errada.

Esse sistema será fundamental para valorizar o trabalho do técnico.

---

# 4. ESTRUTURA DA LIGA

O sistema deverá permitir ligas privadas.

Exemplo:

**Liga dos Amigos 2027**

10 clubes participantes.

Cada clube terá:

- 1 Presidente;
- 1 Técnico.

Total:

20 jogadores humanos.

O sistema deverá suportar diferentes quantidades de clubes.

Inicialmente:

8  
10  
12  
16  
20 clubes.

---

# 5. CRIAÇÃO DO CLUBE

Cada dupla poderá criar:

- Nome;
- Nome curto;
- Sigla;
- Escudo;
- Cor principal;
- Cor secundária;
- Uniforme principal;
- Uniforme reserva;
- Nome do estádio.

Exemplo:

CLUBE

SISBSD FC

SIGLA

SFC

ESTÁDIO

Arena SISBSD

CAPACIDADE

30.000

---

# 6. ESTRUTURA DA TEMPORADA

Uma temporada terá quatro grandes momentos.

## PRÉ-TEMPORADA

Criação dos clubes.

Draft.

Montagem dos elencos.

Preparação tática.

---

## PRIMEIRA METADE

Liga.

Copa.

Mercado fechado.

---

## JANELA DE TRANSFERÊNCIAS

Mercado aberto.

Negociações.

Trocas.

Compras.

Vendas.

---

## SEGUNDA METADE

Continuação da Liga.

Fases finais da Copa.

Encerramento da temporada.

---

# 7. COMPETIÇÕES

## Liga

Pontos corridos.

Vitória:

3 pontos.

Empate:

1 ponto.

Derrota:

0 pontos.

---

### Critérios de desempate

1. Vitórias
2. Saldo de gols
3. Gols marcados
4. Confronto direto
5. Fair Play
6. Sorteio

---

# 8. COPA

Competição mata-mata.

Exemplo com 16 clubes:

Oitavas  
Quartas  
Semifinais  
Final

Poderá haver:

- jogo único;
- ida e volta.

Configuração escolhida pela administração da liga.

---

# 9. BANCO DE JOGADORES

Inicialmente será utilizada uma base baseada nos jogadores dos:

**20 clubes da Série A brasileira.**

Cada jogador terá uma ficha completa.

Exemplo:

Nome: Jogador X

Clube real: Flamengo

Idade: 27

Pé: Direito

Altura: 178 cm

Posição principal: MEI

Posições secundárias:

MC  
PE

Overall:

84

---

# 10. ATRIBUTOS

Cada jogador possuirá atributos de 1 a 100.

Sugestão inicial:

## Técnicos

- Finalização
- Passe
- Cruzamento
- Drible
- Primeiro toque
- Cabeceio
- Bola parada

## Físicos

- Velocidade
- Aceleração
- Força
- Resistência
- Agilidade

## Mentais

- Posicionamento
- Visão
- Decisão
- Antecipação
- Composição
- Trabalho em equipe

## Defensivos

- Marcação
- Desarme
- Interceptação

## Goleiros

- Reflexo
- Posicionamento
- Saída
- Jogo aéreo
- Reposição
- Um contra um

---

# 11. OVERALL

O Overall será calculado utilizando pesos diferentes conforme a posição.

Exemplo simplificado:

## Atacante

Finalização × 25%

Posicionamento × 15%

Velocidade × 15%

Aceleração × 10%

Drible × 10%

Primeiro toque × 10%

Composição × 10%

Cabeceio × 5%

---

Um zagueiro utilizará pesos completamente diferentes.

Isso evita algo como:

um jogador muito rápido receber Overall alto mesmo sendo tecnicamente ruim para sua posição.

---

# 12. OVERALL VISUAL × DESEMPENHO REAL

O Overall deverá ser principalmente uma ferramenta de interface.

Exemplo:

**Gabriel**

OVR 84

Por baixo disso existem diversos atributos.

Durante uma jogada o jogo não calculará:

Gabriel 84 contra João 78.

O cálculo utilizará algo semelhante a:

Finalização do Gabriel

versus

Posicionamento do goleiro

+

pressão do marcador

+

ângulo

+

pé dominante

+

condição física

+

forma

+

situação da jogada

+

elemento aleatório.

---

# 13. POSIÇÕES

Cada jogador terá:

### Posição natural

100% de eficiência.

### Posição secundária

95% a 98%.

### Posição adaptável

85% a 94%.

### Fora de posição

70% a 84%.

### Totalmente incompatível

50% a 69%.

---

# 14. PENALIDADE FORA DE POSIÇÃO

Não será simplesmente:

OVR 84 → OVR 72.

Internamente haverá penalidades diferentes nos atributos.

Exemplo:

Um ponta utilizado como lateral.

Poderá manter:

Velocidade  
Passe  
Drible

Mas receber penalidade em:

Posicionamento defensivo  
Marcação  
Tomada de decisão defensiva.

Na interface poderá aparecer:

OVR NORMAL

84

OVR NA POSIÇÃO ATUAL

76

---

# 15. FORMA ATUAL

Cada jogador terá um indicador de forma.

Escala sugerida:

Muito ruim  
Ruim  
Normal  
Boa  
Excelente

Internamente:

-10 até +10.

Isso influencia ligeiramente determinadas ações.

Nunca poderá transformar um jogador ruim em craque.

---

# 16. CONDIÇÃO FÍSICA

Escala:

0 a 100%.

Exemplo:

100% — totalmente descansado

85% — normal

70% — desgaste

55% — perda perceptível

40% — rendimento prejudicado

Abaixo de 30% — alto risco de lesão.

---

# 17. ENTROSAMENTO

O time terá um valor de entrosamento.

0–100.

Será influenciado por:

- quantidade de jogos juntos;
- manutenção da formação;
- alterações no elenco;
- tempo desde transferências;
- resultados.

O entrosamento poderá ajudar principalmente:

- posicionamento;
- movimentação;
- troca de passes;
- organização defensiva.

---

# 18. MORAL

Cada jogador terá moral individual.

0–100.

Influenciada por:

- tempo em campo;
- vitórias;
- derrotas;
- ser titular;
- ficar muito tempo no banco;
- tentativa de venda;
- conquistas.

Moral terá influência pequena.

Não deverá dominar o desempenho.

---

# 19. DRAFT

Antes da primeira temporada haverá um Draft.

Todos os jogadores da base estarão disponíveis.

---

# 20. SNAKE DRAFT

Modelo inicial recomendado:

Snake Draft.

Exemplo com 4 clubes:

Rodada 1:

A  
B  
C  
D

Rodada 2:

D  
C  
B  
A

Rodada 3:

A  
B  
C  
D

---

# 21. QUANTIDADE DO ELENCO

Sugestão:

**25 jogadores.**

Obrigatórios:

3 goleiros

mínimo 6 defensores

mínimo 6 meio-campistas

mínimo 4 atacantes

As regras podem ser ajustadas posteriormente.

---

# 22. TEMPO DE PICK

Cada clube terá um tempo para selecionar.

Exemplo:

120 segundos.

Aviso:

60 segundos.

30 segundos.

10 segundos.

Se o tempo acabar:

AUTO PICK.

---

# 23. AUTO PICK

O clube poderá criar previamente uma lista.

Exemplo:

1. Jogador A

2. Jogador B

3. Jogador C

Se nenhum estiver disponível:

o sistema seleciona automaticamente considerando:

- necessidade posicional;
- Overall;
- idade;
- equilíbrio do elenco.

---

# 24. SALA DO DRAFT

Interface sugerida:

## Coluna esquerda

Clubes e ordem.

## Centro

Jogadores disponíveis.

Filtros:

posição  
idade  
OVR  
clube real

## Direita

Elenco atual do próprio clube.

Topo:

TIME X ESTÁ ESCOLHENDO

01:27

---

# 25. ECONOMIA

Todos os clubes começam com o mesmo caixa.

Exemplo inicial:

**$100.000.000**

Nome da moeda poderá ser definido posteriormente.

---

# 26. RECEITAS

Principais receitas:

- Bilheteria
- Premiações
- Transferências
- Patrocínio futuramente

---

# 27. DESPESAS

Inicialmente:

- Transferências
- Salários
- Custos dos jogos

Posteriormente:

- estádio
- staff
- centro de treinamento.

---

# 28. SISTEMA DE ESTÁDIO

Cada clube começa com:

Capacidade:

30.000.

O Presidente define o preço dos ingressos antes de cada partida.

---

# 29. DEMANDA DE PÚBLICO

O público será calculado dinamicamente.

A fórmula deverá considerar:

**Torcida base**

×

**Importância do jogo**

×

**Momento do clube**

×

**Qualidade do adversário**

×

**Preço**

×

**Posição na tabela**

×

**Rivalidade**

×

**Fase da competição**

---

# 30. TORCIDA BASE

Cada clube poderá começar igual.

Exemplo:

25.000 torcedores potenciais por partida.

Durante as temporadas a torcida poderá crescer.

---

# 31. FATOR DE IMPORTÂNCIA

Exemplo:

Jogo comum:

1.00

Jogo contra líder:

1.10

Clássico:

1.20

Semifinal:

1.30

Final:

1.50

---

# 32. FATOR PREÇO

O sistema terá um preço de referência.

Exemplo:

$40.

Preço $20:

Fator 1.15

Preço $40:

Fator 1.00

Preço $60:

Fator 0.85

Preço $80:

Fator 0.65

Preço $100:

Fator 0.45

Esse fator também será influenciado pela importância do jogo.

Uma final suporta preços maiores que um jogo comum.

---

# 33. EXEMPLO DE PÚBLICO

Torcida potencial:

25.000

Momento:

1.10

Adversário:

1.10

Importância:

1.20

Preço:

0.90

Resultado:

25.000 × 1.10 × 1.10 × 1.20 × 0.90

≈ 32.670

Se estádio:

30.000

Público:

**30.000**

Lotação completa.

---

# 34. BILHETERIA

Receita bruta:

Público × preço.

Exemplo:

30.000 × $50

=

$1.500.000

Custos operacionais:

10%.

Receita líquida:

$1.350.000.

---

# 35. PREVISÃO DE PÚBLICO

O Presidente não deverá necessariamente saber o número exato.

Antes de definir o ingresso poderá aparecer:

### $30

Previsão:

27.000 – 30.000

### $50

Previsão:

23.000 – 27.000

### $80

Previsão:

14.000 – 19.000

Isso transforma a definição do ingresso em decisão estratégica.

---

# 36. TRANSFERÊNCIAS

Haverá duas janelas por temporada.

Dentro da janela:

transferências imediatas.

Fora:

negociação poderá ser feita, mas a transferência fica agendada.

---

# 37. TIPOS DE PROPOSTA

Compra.

Troca.

Jogador + dinheiro.

Múltiplos jogadores.

Exemplo:

TIME A oferece:

Jogador X

+

$12.000.000

por:

Jogador Y.

---

# 38. MERCADO

Status possíveis:

Disponível

Negociável

Somente boa proposta

Intransferível

---

# 39. PARTIDAS AO VIVO

Este será um dos principais elementos do jogo.

Não será necessário criar uma partida visual semelhante ao EA FC.

A proposta será uma evolução moderna da experiência do:

**Championship Manager 01/02.**

---

# 40. CAMPO 2D

A partida será apresentada em um campo visto de cima.

Jogadores representados por:

círculos / botões.

Cada botão poderá mostrar:

número

nome abreviado.

A bola será um elemento separado.

---

# 41. MOVIMENTAÇÃO

Os jogadores se movimentarão continuamente.

Não será necessário representar todos os detalhes de uma partida real.

O campo servirá principalmente para mostrar:

- posse;
- posicionamento;
- ataques;
- contra-ataques;
- movimentação defensiva;
- chances de gol.

---

# 42. NARRAÇÃO

Paralelamente haverá narração textual.

Exemplo:

**34:21**

André recebe no meio.

Passa para Arrascaeta.

Arrascaeta avança.

Pedro se movimenta entre os zagueiros.

Passe em profundidade!

Pedro domina...

Finaliza!

DEFENDE O GOLEIRO!

---

# 43. EVENTOS IMPORTANTES

A velocidade da partida poderá diminuir automaticamente quando houver:

- chance perigosa;
- gol;
- pênalti;
- falta perigosa;
- cartão;
- substituição;
- lesão.

---

# 44. VELOCIDADE

Opções:

1x

2x

4x

8x

Possibilidade:

“Somente melhores momentos”.

---

# 45. CONTROLE DO TÉCNICO

Durante a partida o técnico poderá modificar:

formação

mentalidade

ritmo

pressão

linha defensiva

largura

estilo de passe

marcação

contra-ataque

substituições.

---

# 46. MENTALIDADE

Cinco níveis:

Muito Defensivo

Defensivo

Equilibrado

Ofensivo

Muito Ofensivo.

---

# 47. RITMO

Baixo

Normal

Alto.

Ritmo alto:

mais ataques

mais desgaste

mais erros.

---

# 48. PRESSÃO

Baixa

Normal

Alta.

Pressão alta:

mais recuperação ofensiva

maior desgaste

risco de espaço nas costas.

---

# 49. LINHA DEFENSIVA

Baixa

Normal

Alta.

Linha alta:

compacta o campo

facilita pressão

mas aumenta risco de bolas nas costas.

---

# 50. ESTILO DE PASSE

Curto

Misto

Direto.

---

# 51. LARGURA

Estreita

Normal

Aberta.

---

# 52. MOTOR DE PARTIDAS

O motor deverá funcionar por ciclos.

Exemplo:

Cada ciclo interno representa:

1 segundo de jogo.

Em cada ciclo o sistema atualiza:

- posição dos jogadores;
- posição da bola;
- intenção tática;
- condição física;
- posse;
- eventos.

---

# 53. ESTADO DA POSSE

A partida poderá trabalhar com estados.

Exemplo:

DEFESA

CONSTRUÇÃO

MEIO-CAMPO

ATAQUE

ÚLTIMO TERÇO

CHANCE

FINALIZAÇÃO

---

# 54. EXEMPLO DO MOTOR

Time A recupera a bola.

Sistema identifica:

recuperação defensiva.

Mentalidade:

Ofensiva.

Contra-ataque:

Ativado.

Jogador com bola:

Passe 82.

Visão 85.

Adversário:

Linha defensiva alta.

O motor identifica oportunidade de passe vertical.

Calcula:

chance de sucesso.

Se sucesso:

atacante recebe em profundidade.

Novo evento:

um contra um.

---

# 55. MOTOR BASEADO EM ATRIBUTOS

Cada ação utilizará atributos específicos.

Exemplo:

## Passe

Passe

Visão

Decisão

Pressão adversária

Distância

Posicionamento do receptor

Entrosamento.

---

## Drible

Drible

Agilidade

Aceleração

Decisão

contra

Desarme

Posicionamento

Agilidade do defensor.

---

## Finalização

Finalização

Composição

Posicionamento

Pé dominante

Ângulo

Distância

Pressão defensiva

contra

Reflexo

Posicionamento

Um contra um do goleiro.

---

# 56. ALEATORIEDADE

O jogo obrigatoriamente terá aleatoriedade.

Porém será:

**aleatoriedade controlada.**

Cristiano Ronaldo pode perder um gol.

Um jogador limitado pode marcar um golaço.

Mas estatisticamente:

o melhor jogador terá desempenho superior ao longo de muitas partidas.

---

# 57. MODELO CONCEITUAL DE AÇÃO

Uma fórmula conceitual poderá seguir:

AÇÃO =

Qualidade técnica

+

Qualidade mental

+

Situação tática

+

Condição

+

Forma

+

Entrosamento

+

Aleatoriedade

-

Pressão adversária.

---

# 58. NÃO EXISTIR RESULTADO PRÉ-DEFINIDO

Importante:

O jogo não deverá escolher antes:

“Time A vence 2x1”.

Depois gerar acontecimentos para justificar isso.

A partida deverá ser simulada ação por ação.

O placar será consequência da simulação.

---

# 59. ESTATÍSTICAS DURANTE A PARTIDA

O técnico verá:

Posse

Finalizações

Finalizações no gol

xG

Passes

Precisão

Desarmes

Escanteios

Faltas

Cartões.

---

# 60. xG

Cada finalização poderá receber um valor de Expected Goals.

Exemplo:

Chute fora da área:

0.05

Cabeçada:

0.12

Cara a cara:

0.42

Pênalti:

0.76

Isso ajudará o técnico a avaliar se o time está criando boas chances.

---

# 61. NOTA DOS JOGADORES

Nota inicial:

6.0.

Ações positivas aumentam.

Ações negativas diminuem.

Escala:

1.0 – 10.0.

---

# 62. PAINEL DURANTE O JOGO

Layout sugerido:

### Esquerda

Campo 2D.

### Direita

Narração.

### Rodapé

Estatísticas.

### Aba lateral

Tática.

---

# 63. ALTERAÇÃO TÁTICA AO VIVO

O técnico poderá abrir rapidamente:

TÁTICA

e alterar:

4-3-3

para

4-2-3-1.

Os jogadores irão gradualmente assumir novas posições.

Não haverá teletransporte instantâneo.

---

# 64. SUBSTITUIÇÕES

Ao selecionar um jogador:

Substituir

Alterar posição

Alterar função

Ver atributos.

---

# 65. FUNÇÕES DOS JOGADORES

Posteriormente poderão existir funções simplificadas.

Exemplo:

Atacante:

Finalizador

Referência

Móvel.

Meio:

Armador

Box-to-box

Volante.

Pontas:

Aberto

Cortando para dentro.

Isso adiciona profundidade sem chegar à complexidade extrema do FM.

---

# 66. AUSÊNCIA DO TÉCNICO

O jogo deverá funcionar mesmo se o técnico estiver offline.

Será utilizada:

Escalação salva

Tática salva

Instruções automáticas.

---

# 67. REGRAS AUTOMÁTICAS

Exemplo:

Se jogador < 60% condição:

Substituir.

Se perdendo aos 70:

Mentalidade ofensiva.

Se vencendo aos 80:

Mentalidade defensiva.

Isso será opcional.

---

# 68. TELA PRINCIPAL

Dashboard diferente para cada função.

---

# 69. DASHBOARD PRESIDENTE

Informações principais:

Saldo

Próximo jogo

Receita recente

Preço do ingresso

Previsão de público

Propostas recebidas

Janela de transferências

Posição do clube.

---

# 70. DASHBOARD TÉCNICO

Próximo jogo

Adversário

Escalação

Formação

Lesionados

Suspensos

Forma

Condição

Últimos resultados

Tabela.

---

# 71. MENU PRESIDENTE

Dashboard

Clube

Finanças

Estádio

Mercado

Transferências

Elenco

Competições

Histórico.

---

# 72. MENU TÉCNICO

Dashboard

Elenco

Escalação

Tática

Treino

Próximo adversário

Competições

Estatísticas

Histórico.

---

# 73. MENU GLOBAL

Liga

Tabela

Resultados

Calendário

Estatísticas

Notícias

Transferências

Clubes

Jogadores

Recordes.

---

# 74. TELA ELENCO

Tabela:

Nome

Posição

OVR

Idade

Condição

Forma

Moral

Jogos

Gols

Assistências

Nota.

Filtros completos.

---

# 75. TELA DO JOGADOR

Foto

Nome

Número

Posições

Overall

Atributos

Forma

Condição

Moral

Contrato

Estatísticas

Histórico.

---

# 76. ESCALAÇÃO

Interface drag-and-drop.

Campo 2D.

O técnico arrasta o jogador para a posição.

O sistema mostra imediatamente:

OVR natural:

84

OVR na posição:

77.

---

# 77. ALERTA DE POSIÇÃO

Exemplo:

⚠ Jogador improvisado.

Eficiência:

82%.

Problemas:

Posicionamento defensivo

Marcação.

---

# 78. ANÁLISE DO ADVERSÁRIO

Mostrar:

Formação mais utilizada

Últimas partidas

Gols marcados

Gols sofridos

Principais jogadores

Mapa de desempenho.

Não mostrar exatamente a tática configurada para o próximo jogo.

---

# 79. CENTRAL DE NOTÍCIAS

O sistema deverá gerar notícias automaticamente.

Exemplos:

TIME AZUL assume liderança.

TIME VERDE oferece $28 milhões por Pedro.

João chega ao 10º gol.

TIME AMARELO está há seis partidas invicto.

---

# 80. RIVALIDADES

O sistema poderá gerar rivalidades dinamicamente.

Fatores:

finais

disputa de título

eliminações

jogos históricos

proximidade constante na tabela.

Rivalidade aumenta:

interesse

público

pressão.

---

# 81. HISTÓRICO

Nunca apagar dados históricos.

Guardar:

temporadas

campeões

artilheiros

elencos

transferências

recordes.

---

# 82. RECORDES

Maior goleada

Maior público

Maior renda

Maior transferência

Maior sequência invicta

Mais gols em temporada

Mais assistências

Mais títulos.

---

# 83. HALL DA FAMA

Jogadores históricos poderão ser registrados.

Exemplo:

Pedro

158 jogos

96 gols

34 assistências

3 ligas

2 copas.

---

# 84. BANCO DE DADOS — ENTIDADES PRINCIPAIS

Estrutura inicial recomendada.

---

## users

id

name

email

password_hash

avatar

status

created_at

---

## leagues

id

name

season_current

status

settings_json

---

## clubs

id

league_id

name

short_name

logo

primary_color

secondary_color

stadium_name

stadium_capacity

balance

fan_base

---

## club_members

id

club_id

user_id

role

Valores:

PRESIDENT

COACH.

---

# 85. PLAYERS

id

real_name

birth_date

height

preferred_foot

primary_position

overall

potential

---

# 86. PLAYER_ATTRIBUTES

player_id

finishing

passing

crossing

dribbling

first_touch

heading

speed

acceleration

strength

stamina

agility

positioning

vision

decisions

anticipation

composure

teamwork

marking

tackling

interceptions

etc.

---

# 87. PLAYER_POSITIONS

player_id

position

proficiency.

Exemplo:

ATA 100

PE 94

PD 91

MEI 77.

---

# 88. CLUB_PLAYERS

club_id

player_id

shirt_number

morale

fitness

form

status

joined_at.

---

# 89. MATCHES

id

competition_id

season_id

home_club_id

away_club_id

scheduled_at

status

home_score

away_score

attendance

ticket_price

revenue.

---

# 90. MATCH_LINEUPS

match_id

club_id

player_id

position

role

starter.

---

# 91. MATCH_EVENTS

id

match_id

game_second

type

club_id

player_id

secondary_player_id

metadata_json.

Eventos:

PASS

SHOT

GOAL

SAVE

FOUL

CARD

SUBSTITUTION

INJURY

OFFSIDE.

---

# 92. MATCH_PLAYER_STATS

match_id

player_id

minutes

goals

assists

shots

passes

successful_passes

tackles

interceptions

rating.

---

# 93. TACTICS

club_id

formation

mentality

tempo

pressing

defensive_line

width

passing_style

counter_attack

instructions_json.

---

# 94. TRANSFERS

id

from_club_id

to_club_id

player_id

value

status

created_at

completed_at.

---

# 95. TRANSFER_OFFERS

id

sender_club

receiver_club

cash

status

expires_at.

---

# 96. TRANSFER_OFFER_PLAYERS

offer_id

player_id

direction.

---

# 97. DRAFTS

id

league_id

status

current_round

current_pick

pick_deadline.

---

# 98. DRAFT_PICKS

draft_id

round

pick

club_id

player_id

picked_at.

---

# 99. CLUB_FINANCES

id

club_id

type

value

description

reference_id

created_at.

Tipos:

TICKET

TRANSFER

PRIZE

SALARY

STADIUM.

---

# 100. COMPETITIONS

id

league_id

name

type.

Tipos:

LEAGUE

CUP.

---

# 101. SEASONS

id

league_id

number

start_date

end_date

status.

---

# 102. ARQUITETURA WEB

Sugestão inicial:

## Front-end

React / Next.js

## Back-end

Node.js

## Banco

PostgreSQL

## Cache

Redis

## Comunicação ao vivo

WebSocket / Socket.IO

---

# 103. MOTOR DE JOGO

Recomendação importante:

O motor da partida deve ser independente da interface.

Exemplo:

`match-engine`

recebe:

times

escalações

atributos

táticas.

E devolve:

estado da partida

eventos

estatísticas.

---

Isso permitirá futuramente:

- alterar interface;
- criar aplicativo;
- rodar simulações;
- testar equilíbrio;
- reproduzir partidas.

---

# 104. SIMULAÇÃO DETERMINÍSTICA

Cada partida deverá possuir uma:

**random seed.**

Exemplo:

`match_seed = 918281982`

Utilizando essa seed, a mesma partida poderá ser reproduzida exatamente.

Isso será extremamente útil para:

- debugging;
- suporte;
- testes;
- investigação de bugs.

---

# 105. SERVIDOR AUTORITATIVO

Todas as decisões deverão acontecer no servidor.

Nunca no navegador.

Especialmente:

resultado

eventos

transferências

dinheiro

draft

atributos.

O navegador apenas envia comandos.

Isso evita manipulação.

---

# 106. PARTIDA EM TEMPO REAL

Fluxo:

Servidor inicia partida.

↓

Engine executa simulação.

↓

Eventos são gravados.

↓

WebSocket envia atualização.

↓

Navegador anima o campo.

---

# 107. INTERAÇÃO DO TÉCNICO

Exemplo:

Técnico altera:

Mentalidade:

Equilibrada → Ofensiva.

Frontend envia:

`TACTIC_CHANGE`

Servidor valida.

Engine recebe alteração.

A partir daquele segundo do jogo:

nova tática passa a influenciar os cálculos.

---

# 108. REPLAY

Como os eventos são armazenados, será possível reproduzir partidas posteriormente.

Isso permitirá:

“Assistir replay”.

Sem precisar recalcular toda a partida.

---

# 109. MVP — VERSÃO 1

A primeira versão jogável deverá conter apenas o essencial.

### Usuários

Cadastro

Login

---

### Liga

Criar liga

Entrar em liga

---

### Clube

Criar clube

Presidente

Técnico

---

### Jogadores

Base

Atributos

Overall

Posições

---

### Draft

Sala

Picks

Elencos.

---

### Técnico

Escalação

Formação

Táticas básicas.

---

### Partidas

Engine

Campo 2D

Narração

Alterações táticas

Substituições.

---

### Competições

Liga

Tabela

Resultados.

---

# 110. MVP — VERSÃO 2

Adicionar:

Copa

Finanças

Bilheteria

Público

Transferências

Janela

Estatísticas.

---

# 111. VERSÃO 3

Adicionar:

Moral

Forma

Lesões

Entrosamento

Rivalidades

Notícias

Recordes.

---

# 112. VERSÃO 4

Adicionar:

Evolução

Potencial

Categorias de base

Estádio

Patrocínios

Treinamentos.

---

# 113. PRIORIDADE MAIS IMPORTANTE

Antes de criar dezenas de recursos administrativos, deve ser validado o:

**MOTOR DE PARTIDAS.**

Se a partida for divertida e fizer o técnico sentir que suas decisões importam, o restante do jogo poderá crescer ao redor disso.

A primeira prova de conceito deverá permitir:

Time A

vs

Time B

com jogadores reais.

O usuário deverá conseguir:

escalar

escolher formação

selecionar estratégia

iniciar jogo

acompanhar campo 2D

ver narração

alterar tática

substituir jogadores.

---

# 114. OBJETIVO DA PRIMEIRA PROVA DE CONCEITO

Não haverá inicialmente:

mercado

estádio

dinheiro

liga completa

draft.

A prova deverá responder apenas:

**“É divertido assistir e comandar uma partida?”**

Se a resposta for positiva, o restante do jogo será construído sobre essa fundação.

---

# 115. PRINCÍPIO FINAL DO MOTOR

O sistema deverá produzir situações como:

Time A possui jogadores melhores.

Mas Time B utiliza uma estratégia adequada.

Time A joga com linha alta.

Time B possui atacante muito rápido.

O técnico do Time B configura contra-ataque.

Durante a partida o motor reconhece:

espaço atrás da defesa.

E passa a gerar mais oportunidades relacionadas àquela fraqueza.

Isso é muito mais importante que simplesmente:

Time A OVR médio 82.

Time B OVR médio 79.

Portanto:

Time A vence.

O jogo deverá premiar:

**qualidade do elenco + decisões do técnico + planejamento do Presidente.**

---

# 116. VISÃO FINAL

O projeto será:

**Um manager de futebol multiplayer online onde cada clube é administrado conjuntamente por um Presidente e um Técnico.**

Ele combina:

Draft estilo NBA/NFL

Gestão financeira

Mercado entre jogadores

Campeonato em pontos corridos

Copa mata-mata

Simulação tática

Partidas 2D

Economia

Histórico permanente.

O objetivo não é competir com Football Manager em quantidade de opções.

O objetivo é criar uma experiência:

**mais acessível, social, competitiva e divertida para jogar com amigos.**

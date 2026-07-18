# 🎨 Registro — Front-end

Telas, usabilidade e responsividade. Formato em [`README.md`](README.md).

---

## 2026-07-17 — Planify: hub por tipo de arquivo

- **O que mudou:** a entrada virou um HUB — a pessoa vê a LOGO do que trabalha
  (Excel, Word, Fotos, Arquivos por data, PDF) e clica.
  - `tipos-arquivo.ts` — catálogo dos 5 tipos com logo (CSS puro), extensões e
    operações de cada um.
  - `arquivo-ops.ts` — operações que rodam 100% no navegador: texto (Título/
    MAIÚSC/minúsc, numerar, lista→tabela) e **renomear/organizar em lote** que
    gera um SCRIPT .bat pronto (o navegador não move arquivo, mas entrega o que
    resolve o trabalho manual).
  - `app.component` ganhou o hub + tela de texto + tela de arquivos em lote,
    mantendo o organizador de planilhas completo que já existia.
- **Decisão honesta (regra 3):** juntar PDF e ler EXIF de foto precisam do
  desktop — sinalizado na tela, não finjo que roda. O que dá para fazer com
  segurança no navegador (renomear por padrão, agrupar por data via script)
  está 100% funcional.
- **O que foi testado:** vitest (28, +9 de arquivo-ops) + navegador: hub com as
  5 logos; Documentos formatando "ana lima" → "Ana Lima"; Arquivos renomeando
  DSC0001.jpg → arquivo-001.jpg com script .bat; organizar por data separando
  em 2026/07 e 2026/08.
- **Resultado:** ✅ 28 testes, build limpo (1 warning cosmético NG8107), fluxos
  confirmados com print.
- **Pendências:** PDF merge e EXIF ficam para o app de desktop (documentado).

## 2026-07-17 — MetaGrana: menu de categorias + busca multi-fonte

- **O que mudou:**
  - `categorias.js` — árvore carro>marca>modelo, moto, imóvel>tipo, PC, game,
    celular, eletro. As folhas viram o termo de busca (imóvel prefixa o tipo).
  - `fontes.py` (back) + espelho no motor local — busca MULTI-FONTE: preço real
    do Mercado Livre (API pública, link direto ao anúncio) + links de busca
    profunda das outras lojas (Amazon/Magalu/Americanas/Casas Bahia/OLX),
    já ordenados por menor preço. Imóvel troca para portais (VivaReal/ZAP/OLX).
  - `Buscar.vue` — menu de 3 níveis com breadcrumb; cards de oferta com a FONTE
    embaixo e link que abre DIRETO no produto. Abas separam "Meu dinheiro" de
    "Caçar preços".
  - `Promocoes.vue` — filtro por categoria (Tudo/Eletrônicos/Games/Casa).
- **Decisão honesta (regra 1):** só o Mercado Livre tem API pública sem chave;
  as demais exigem parceria de afiliado. Em vez de fingir preço, cada loja vira
  um link de busca profunda ao produto — o usuário compara em 1 clique e vê a
  fonte. Documentado no topo do `fontes.py`.
- **O que foi testado:** pytest (45, +6 de fontes) + vitest (14, +7 de categorias)
  + navegador: carro>Honda>Civic com link Amazon `?k=Civic&s=price-asc-rank`
  (direto, menor preço); imóvel>Apartamento>2 dormitórios usando OLX Imóveis/
  VivaReal/ZAP; filtro de promoções na tela.
- **Resultado:** ✅ 45 back + 14 front, build limpo, fluxos confirmados com print.
- **Pendências:** preço real hoje só do ML; as outras lojas são link (limite dos
  termos de uso delas, não do código). Se um dia houver chave de afiliado, dá
  para trazer preço real de mais lojas sem mudar a tela.

## 2026-07-17 — CorteCerto: CRM do dono + tela do produtor + placa grande

- **O que mudou:**
  - `crm.js` — matemática do dono (faturamento só do que foi ENTREGUE, lucro com
    margem, a receber, ticket médio, faturamento por material, produtividade,
    conferência de produção). Módulo puro e testado.
  - **Tela do Dono** (`Dono.svelte`): KPIs, "de onde vem o dinheiro" por material,
    ranking de produtividade e cadastro/desligamento de funcionários.
  - **Tela do Produtor** (`Produtor.svelte`): feita para monitor de parede — fila
    de pedidos, placa GRANDE com a sobra (só produtor vê), campo "cortei peças a
    mais" que registra a peça extra no estoque, crédito ao funcionário que cortou.
  - **Placa maior e realista** (`CorteVisual` ganhou `grande` e `mostrarSobra`):
    cliente vê a placa e as peças SEM a sobra; produtor vê tudo.
  - Navegação separada em **público** (início/pedido/acompanhar) e **área interna**
    (dono/produtor/estoque) — cada tela com um dono claro.
- **O que foi testado:** `npx vitest run` (25 no total: 11 CRM + 14 corte) +
  navegador: painel do dono com "A receber R$ 844" e faturamento R$ 0 (nada
  entregue), produtividade Zé 5 / Maria 0; produtor cortando item com 1 peça a
  mais → "Cortado — 3 peças (1 a mais no estoque)".
- **Resultado:** ✅ 25 testes, build limpo, CRM e produtor confirmados com print.
- **Pendências:** as funções do CRM idealmente viveriam também no back-end .NET
  (hoje só no front); fica como evolução quando o backend hospedado entrar.

## 2026-07-17 — RotaKids: telas completas (cadastro, ida/chamada/volta, acompanhar)

- **O que mudou:** o front virou o produto inteiro.
  - **Motor local** (`motor-local.js`) IMPORTA o domínio do servidor
    (`../../src/domain/*`) em vez de reescrever — a máquina de estados roda a
    MESMA classe nos dois lados. Vite liberado para ler fora de `frontend/`.
  - **Cadastro do motorista em 3 passos** (Você → Habilitação → Sua van) e do
    aluno completo, com validação **campo a campo** (componente `Campo.jsx`):
    o erro aparece embaixo do campo errado, não numa faixa genérica.
  - **Painel do motorista**: uma AÇÃO GRANDE por vez (o tio está dirigindo) —
    ida com "Peguei fulano", chamada na escola com trava até completar, volta
    com "Entreguei em casa", encerramento.
  - **Painel do pai**: acompanhar com frase em português primeiro, cartão do
    motorista com botão de ligar, linha do tempo (log de eventos) e mapa.
    Atualiza sozinho a cada 15s.
  - Login com escolha de perfil (cada um tem cadastro diferente).
- **O que foi testado:** `npm test` (15) + `npm run build` + **fluxo completo no
  navegador**: iniciar dia → pegar Ana e Bruno (Caio faltou, ficou fora) → chegar
  na escola → chamada (Ana volta, Bruno o pai buscou) → botão travado até a
  chamada fechar → volta só com Ana → entregar → "Dia concluído". E validação:
  CPF 111.111.111-11 rejeitado com "esse CPF não existe", celular/email/nome
  com erro embaixo do campo.
- **Resultado:** ✅ 15 testes, build limpo, fluxo ponta a ponta confirmado com
  print. Rota pelas ruas (OSRM) e alternativas ("⚡ Mais rápida · 15 min") OK.
- **Pendências:** camada de trânsito no mapa (comentário `🔌` já no `MapaVan.jsx`
  esperando a chave). Rastreamento ao vivo real depende do backend hospedado —
  na versão web a van "anda" para a última parada, o que é honesto e declarado.

## 2026-07-16 — Início do registro por área

- **O que mudou:** adoção do [REGRAS.md](../REGRAS.md).
- **O que foi testado:** nada (mudança de processo).
- **Resultado:** —
- **Pendências:** entradas anteriores estão só no histórico do Git.

## 2026-07-15 — RotaKids: modo trajeto + rotas por ruas

- **O que mudou:** botão **Iniciar trajeto**; a cada parada o motorista marca
  "peguei" e o pino da criança vira **azul**; ao fim, tela de trajeto concluído.
  Rota agora vem do **OSRM com alternativas** (`alternatives=true`), seguindo as
  ruas — o tio escolhe pelo tempo ("⚡ Mais rápida · 15 min · 7.9 km").
  Avatares das crianças viram os pinos do mapa; resumo do dia com contadores.
- **O que foi testado:** `npm test` (Vitest) + fluxo real no navegador: login →
  calcular rota → escolher alternativa → iniciar → marcar → concluir.
- **Resultado:** ✅ 15 testes. No navegador: rota traçada pelas ruas, "Trajeto
  concluído! 2 crianças entregues", pino azul confirmado no mapa.
- **Pendências:** nenhuma.

## 2026-07-15 — Planify: motor local + análise na tela

- **O que mudou:** `motor-local.ts` — o site publicado processa o arquivo **de
  verdade** no navegador (parse, todas as operações, profiling, resumo, ViaCEP).
  Tela ganhou acordeões (formatação por coluna / análise financeira), tabela de
  **perfil dos dados** e **resumo financeiro** com barras.
- **O que foi testado:** `npm test` (Vitest) + upload real de `gastos.csv` no
  navegador com resumo financeiro ligado.
- **Resultado:** ✅ 19 testes. No navegador: 5→4 linhas (1 duplicada removida),
  perfil detectou texto/número/data com estatísticas, resumo deu mercado
  R$ 1.334,56 (91,75%) e lazer R$ 120,00 (8,25%).
- **Pendências:** `.xlsx` só é lido pelo back-end Java (o motor local lê CSV) —
  documentado na tela.

## 2026-07-15 — CorteCerto: desenho do corte

- **O que mudou:** componente `CorteVisual.svelte` desenha a chapa em proporção
  real — peças com medida, linha da serra (✂️), sobra hachurada e cota total.
  Usado na Home (exemplo fixo), na simulação do pedido e na calculadora.
  Marca passou a **MadeiraFort**; nova aba **Acompanhar** (código MF-XXXXX).
- **O que foi testado:** `npm test` (Vitest) + navegador (Home e Acompanhar).
- **Resultado:** ✅ 14 testes. Desenho confere: 90 cm → 2 peças de 35,7 + sobra 18,6.
- **Pendências:** nenhuma.

## 2026-07-15 — MetaGrana e portfólio

- **O que mudou:** MetaGrana com cards de cotações ao vivo no robô de dicas.
  Portfólio: trajetória real (currículo), rolagem dinâmica (barra de progresso,
  contadores animados, revelação em cascata) e seção "Por que me contratar?".
- **O que foi testado:** `npm test` nos dois + navegador.
- **Resultado:** ✅ MetaGrana 8, portfólio 10 testes. Seções conferidas na tela.
- **Pendências:** nenhuma.

# 🎨 Registro — Front-end

Telas, usabilidade e responsividade. Formato em [`README.md`](README.md).

---

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

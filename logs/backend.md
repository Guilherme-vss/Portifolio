# ⚙️ Registro — Back-end

APIs, domínio e regras de negócio. Formato em [`README.md`](README.md).

---

## 2026-07-16 — RotaKids: banco completo + rotas do trajeto

- **O que mudou:**
  - **Esquema novo** (`db/init.sql`): `usuarios` com CPF/nascimento/celular,
    `motoristas` (CNH) e `veiculos` separados — coluna que nunca se preenche é
    cheiro de modelagem preguiçosa. `alunos` com responsável + emergência
    obrigatórios. `trajetos` + `trajeto_alunos` guardam a máquina de estados.
    **`eventos` é append-only**: é o que responde ao pai "que horas ela embarcou?"
    e o que protege o motorista. Constraints cobram o que o domínio valida
    (categoria D/E, falta com motivo, emergência ≠ responsável).
  - **Rotas:** cadastro completo com todos os erros de uma vez; `/api/trajeto/*`
    (iniciar, embarcar, concluir-ida, chamada, iniciar-volta, entregar, posicao);
    `/api/alunos/:id/acompanhar` (linha do tempo do pai); `/api/auth/eu`.
  - **Bug pego:** `rotas.ts` e `vinculos.ts` consultavam `contato_emergencia` e
    `u.telefone` — colunas que o esquema novo não tem. TypeScript não vê SQL em
    string; achei com `grep`, não com o compilador. Corrigido.
- **O que foi testado:** `npm test` + **`pg-mem`** (Postgres em memória) rodando o
  `init.sql` de verdade e exercitando as constraints: CNH categoria B rejeitada,
  emergência igual ao responsável rejeitada, falta sem motivo rejeitada, status/fase
  inventados rejeitados, veículo com ano/lugares fora da faixa rejeitado.
- **Resultado:** ✅ **85 testes, 0 falhas** (38 validações + 23 trajeto + 14 rota +
  10 esquema). `npm run build` limpo.
- **Pendências — o que NÃO foi executado (sem Docker/Postgres aqui):**
  - As **rotas HTTP** não rodaram contra um banco real: foram compiladas e
    revisadas, não exercitadas. Próximo passo natural é um teste de integração.
  - `pg-mem` **não é o Postgres inteiro** — valida esquema e constraints, mas o
    teste definitivo continua sendo o container.
  - Quem já tem o banco antigo precisa de `docker compose down -v` (o esquema
    mudou; não escrevi migração porque o `init.sql` roda em banco novo).

## 2026-07-16 — RotaKids: camada de confiança + máquina de estados do dia

- **O que mudou:** duas peças novas no domínio (sem tocar em banco/rede):
  - `src/domain/validacoes.ts` — CPF e CNH pelo **algoritmo oficial** (dígito
    verificador), categoria D/E obrigatória por lei para escolar, placa antiga e
    Mercosul, celular BR (DDD + 9), faixa etária (aluno 1–17, motorista 21+),
    validade de CNH com aviso de 30 dias. Cadastros devolvem **todos os erros de
    uma vez**, campo a campo.
  - `src/domain/trajeto.ts` — o dia inteiro como máquina de estados:
    `ida → chamada → volta → encerrado`. Regras vindas da frente do especialista:
    na volta **só existe quem foi à escola**; a chamada é obrigatória antes de
    sair; criança na van na volta é **vermelha** (responsabilidade aberta) e só
    vira **verde** quando entregue e confirmada.
- **O que foi testado:** `npm test` — casos felizes, bordas (17 vs 18 anos, 21 vs
  20, CNH vencendo em 30 dias) e erros que a vida não permite (embarcar quem
  faltou, embarcar 2x, chegar na escola com criança na rua, sair com chamada pela
  metade, entregar quem não está na van).
- **Resultado:** ✅ **75 testes, 0 falhas** (38 validações + 23 trajeto + 14 rota).
  `npm run build` compila sem erro.
- **Pendências:** falta a persistência (tabelas de motorista/veículo/trajeto), as
  rotas HTTP e a UI. Trânsito no mapa depende de chave do TomTom/Mapbox (do
  Guilherme). Rastreamento ao vivo depende do backend hospedado (Render/Railway).

## 2026-07-16 — Início do registro por área

- **O que mudou:** adoção do [REGRAS.md](../REGRAS.md); este registro passa a ser
  a memória de trabalho do back-end.
- **O que foi testado:** nada (mudança de processo).
- **Resultado:** —
- **Pendências:** entradas anteriores a esta data estão só no histórico do Git.

## 2026-07-15 — Planify: camada de análise de dados (DDD)

- **O que mudou:** novo pacote `domain/analise` com `AnalisadorPlanilha`
  (profiling de colunas + resumo financeiro), `PerfilColuna`, `TipoColuna` e
  `ResumoFinanceiro`. Novas operações no agregado `Planilha`: `semAcentos`,
  `comMoedaNormalizada`, `comDatasNormalizadas`, `comColunaMaiuscula/Minuscula`.
  DTOs e caso de uso ampliados; controller com os novos parâmetros.
- **O que foi testado:** `mvn test` — profiling (tipo, preenchimento, únicos,
  mín/máx/média/soma), resumo financeiro (agrupamento, ordem decrescente,
  categoria vazia), moeda BR (R$ 1.234,56), datas BR (dd/MM/yyyy e dd-MM-yyyy).
- **Resultado:** ✅ 34 testes, 0 falhas.
- **Pendências:** nenhuma.

## 2026-07-15 — MetaGrana: robô de cotações (substitui dica local)

- **O que mudou:** novo serviço `services/cotacoes.py` consumindo a **AwesomeAPI**
  (USD/EUR/BTC ao vivo) + regras que cruzam mercado com os gastos do usuário.
  `/api/dicas` agora devolve `cotacoes` e usa fonte `mercado+regras` (ou `ia`).
- **O que foi testado:** `pytest` — parse das 3 moedas, moeda faltando, resposta
  vazia, dólar em alta/queda, bitcoin volátil.
- **Resultado:** ✅ 39 testes, 0 falhas.
- **Pendências:** a AwesomeAPI é pública e sem chave — se mudar o contrato, o
  fallback mantém as dicas dos gastos (degradação prevista).

## 2026-07-15 — CorteCerto: pedidos multi-itens e só madeira

- **O que mudou:** `Pedido` passou a ter lista de `PedidoItem` (cada um com chapa,
  medida, quantidade e flag `Feito`); código de acompanhamento `MF-XXXXX`; rota
  pública `/api/pedidos/acompanhar/{codigo}`; rota para marcar item feito.
  Catálogo trocado de alumínio para **MDF/HDF/compensado**.
- **O que foi testado:** xUnit (validações de pedido, item, status, estoque e
  formato do código). **Não executado localmente** — não há .NET SDK nesta máquina;
  roda no pipeline via container `mcr.microsoft.com/dotnet/sdk:8.0`.
- **Resultado:** ⚠️ verificado por revisão de código; execução pendente no CI.
- **Pendências:** rodar `dotnet test` no Jenkins para confirmar.

## 2026-07-15 — RotaKids: avatar do aluno

- **O que mudou:** coluna `avatar` em `alunos` (`db/init.sql`), aceita no cadastro
  e devolvida na rota do motorista.
- **O que foi testado:** `npm test` (Jest) — Haversine, vizinho mais próximo,
  distância total, URLs OSRM/Nominatim.
- **Resultado:** ✅ 14 testes, 0 falhas. TypeScript compila sem erro.
- **Pendências:** nenhuma.

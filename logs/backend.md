# ⚙️ Registro — Back-end

APIs, domínio e regras de negócio. Formato em [`README.md`](README.md).

---

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

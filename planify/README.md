# 📊 Planify — organize qualquer planilha em segundos

Quem nunca recebeu uma planilha bagunçada? Linhas vazias no meio, registros
duplicados, espaços sobrando, tudo fora de ordem... O Planify resolve isso:
você **envia o arquivo, marca o que quer fazer, e recebe tudo organizado** —
com métricas mostrando exatamente o que foi feito.

## 💡 O que ele faz

Você envia um **CSV** (vírgula ou ponto-e-vírgula) ou **XLSX** (Excel) e escolhe:

- 🧹 **Limpar espaços** — remove espaços extras dentro das células
- 🕳️ **Remover linhas vazias** — some com os "buracos" da planilha
- 👯 **Remover duplicadas** — mantém só a primeira ocorrência (ignora maiúsculas)
- 🔤 **Ordenar por coluna** — crescente ou decrescente, e **números são ordenados
  como números** (9 antes de 10, incluindo o formato brasileiro "1.234,56")
- 📮 **Normalizar CEPs** — padroniza para `00000-000` e **enriquece** a planilha
  com colunas de cidade e UF preenchidas automaticamente pela API do **ViaCEP**
- 💰 **Normalizar moeda** — "R$ 1.234,56" → `1234.56` (o formato universal de dados)
- 📅 **Normalizar datas** — "05/03/2026" → `2026-03-05` (ISO), reconhecendo os formatos BR
- 🔤 **Remover acentos** + **MAIÚSC/minúsc por coluna** — padroniza UF, e-mails e chaves

E, pensando como um **analista de dados**, duas análises automáticas:

- 🔎 **Perfil dos dados (profiling)** — o raio-X de cada coluna: tipo detectado
  (número, moeda, data, texto), % de preenchimento, valores únicos e, para
  colunas numéricas, mínimo, máximo, média e soma.
- 💹 **Resumo financeiro** — agrupa por uma coluna de categoria e soma uma coluna
  de valores ("quanto gastei por categoria?"), do maior para o menor, com barras.

No final: barra de **progresso por etapas**, métricas do antes/depois, prévia,
**exportação para CSV, Excel, Word e Google Planilhas/Docs**, e **histórico**.

## 🏛️ Arquitetura: DDD em camadas (Maven)

O back-end segue **Domain-Driven Design** com **DTOs** nas bordas — a dupla
clássica do mercado corporativo Java:

```
src/main/java/com/planify/
├── domain/                      ← o CORAÇÃO: regras puras, sem framework
│   ├── planilha/
│   │   ├── Planilha.java        ← agregado raiz IMUTÁVEL (cada operação → nova planilha)
│   │   └── Cep.java             ← Objeto de Valor: um Cep só existe se for válido
│   └── historico/Processamento.java  ← entidade do histórico
├── application/                 ← casos de uso + DTOs (orquestra, não decide)
│   ├── OrganizarPlanilhaUseCase.java
│   ├── dto/                     ← OpcoesOrganizacaoDTO, MetricasDTO, OrganizacaoResponseDTO...
│   └── portas/BuscadorDeEndereco.java  ← interface (inversão de dependência)
├── infrastructure/              ← o mundo externo
│   ├── arquivo/LeitorDeArquivos.java   ← CSV/XLSX → Planilha (Apache POI)
│   ├── viacep/ViaCepClient.java        ← implementa a porta de endereços
│   └── persistencia/ProcessamentoRepository.java  ← Spring Data
└── interfaces/rest/PlanilhaController.java  ← borda HTTP: só traduz DTO ↔ caso de uso
```

**As regras da casa:**
- O **domínio não conhece** HTTP, banco nem APIs externas — é testável puro.
- A **entidade JPA nunca sai** pela borda HTTP: quem viaja é o `ProcessamentoDTO`.
- O caso de uso depende da **porta** `BuscadorDeEndereco`; o `ViaCepClient` é
  só um adaptador — trocar de fornecedor de CEP não toca no núcleo.

## 🛠️ Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Front-end | **Angular 17** (pasta `frontend/`) | A dupla clássica do corporativo: Spring + Angular |
| Back-end | **Java 17 + Spring Boot 3 (Maven)** | DDD em camadas com DTOs |
| Banco | **MySQL** | histórico de processamentos via JPA |
| Planilhas | Apache POI | o padrão do ecossistema Java para .xlsx |
| Enriquecimento | **API ViaCEP** | pública, sem chave, dados oficiais |
| Testes | JUnit 5 + Mockito (back) / Vitest (front) | domínio, caso de uso e utilitários |

## 🚀 Como rodar

### Com Docker (recomendado — não precisa de Java, Maven nem Node!)
```bash
docker compose up -d --build
# acesse http://localhost:8081
```

### Manualmente (desenvolvimento)
```bash
# suba um MySQL local com banco/usuário "planify" (ou use o do compose)
mvn spring-boot:run                  # API em http://localhost:8080

# em outro terminal — o front Angular com recarga automática:
cd frontend
npm install
npm start                            # http://localhost:4200 (proxy para a API)
```

## 🧪 Testes

```bash
mvn test                 # domínio + caso de uso + leitor — 20 testes
cd frontend && npm test  # utilitários do front — 7 testes
```

## 🔌 API

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/api/organizar` | multipart: `arquivo` + flags → dados + CSV + métricas |
| GET | `/api/historico` | últimos 20 processamentos (como DTOs) |
| GET | `/api/saude` | health check |

Parâmetros do `/api/organizar`: `limparEspacos`, `removerVazias`,
`removerDuplicadas` (booleanos, padrão `true`), `colunaOrdenacao` e `colunaCep`
(índice a partir de 0; `-1` desliga), `ordemCrescente`.

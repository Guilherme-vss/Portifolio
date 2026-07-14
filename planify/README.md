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

No final: prévia dos dados na tela, **download do CSV organizado** (com BOM,
para o Excel abrir os acentos direitinho) e as métricas de antes/depois.
Cada processamento fica registrado no **histórico** (MySQL).

## 🛠️ Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Back-end | **Java 17 + Spring Boot 3** | A dupla mais pedida do mercado corporativo brasileiro |
| Banco | **MySQL** | Histórico de processamentos com JPA/Hibernate |
| Planilhas | Apache POI | O padrão do ecossistema Java para .xlsx |
| Enriquecimento | **API ViaCEP** | Pública, sem chave, dados oficiais de CEP |
| Testes | JUnit 5 | Todas as operações de organização testadas |

## 🚀 Como rodar

### Com Docker (recomendado — não precisa de Java nem Maven instalados!)
```bash
docker compose up -d --build
# acesse http://localhost:8081
```
O primeiro build demora alguns minutos (o Maven baixa as dependências dentro
do container). Os seguintes são rápidos, graças ao cache.

### Manualmente (precisa de Java 17 + Maven)
```bash
# suba um MySQL local com banco/usuário "planify" (ou use o do compose)
mvn spring-boot:run
# acesse http://localhost:8080
```

## 🧪 Testes

```bash
mvn test
# ou, sem Maven instalado:
docker run --rm -v "%cd%":/app -w /app maven:3.9-eclipse-temurin-17 mvn test
```
Os testes cobrem leitura de CSV (ambos os separadores), remoção de vazias e
duplicadas, limpeza de espaços, ordenação com cabeçalho preservado, ordenação
numérica no formato brasileiro e a normalização de CEPs.

## 🔌 API

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/api/organizar` | multipart: `arquivo` + flags das operações → dados organizados + CSV + métricas |
| GET | `/api/historico` | últimos 20 processamentos |
| GET | `/api/saude` | health check |

Parâmetros do `/api/organizar`: `limparEspacos`, `removerVazias`,
`removerDuplicadas` (booleanos, padrão `true`), `colunaOrdenacao` e `colunaCep`
(índice da coluna a partir de 0; `-1` desliga), `ordemCrescente`.

## 📁 Estrutura

```
planify/
├── src/main/java/com/planify/
│   ├── PlanifyApplication.java
│   ├── controller/PlanilhaController.java    # API REST
│   ├── service/
│   │   ├── OrganizadorService.java           # operações (100% testadas)
│   │   └── ViaCepService.java                # normalização + enriquecimento
│   ├── model/Processamento.java              # entidade do histórico
│   └── repository/ProcessamentoRepository.java
├── src/main/resources/
│   ├── application.properties
│   └── static/index.html                     # interface responsiva
├── src/test/java/...                         # JUnit 5
├── Dockerfile                                # build em 2 etapas
├── docker-compose.yml                        # app + MySQL
└── Jenkinsfile
```

## 🧠 Decisões de projeto

- As operações trabalham sobre `List<List<String>>` — uma estrutura simples que
  torna o serviço **testável sem arquivo, banco ou rede**.
- Se o ViaCEP estiver fora do ar, o processamento **continua** — as colunas de
  cidade/UF só ficam vazias (degradação graciosa).
- O CSV de saída usa ponto-e-vírgula, o padrão que o Excel brasileiro espera.

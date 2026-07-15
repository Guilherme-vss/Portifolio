# ✂️ CorteCerto — sistema para esquadrias (AlumiFort)

Sistema completo para uma empresa de esquadrias de alumínio (a fictícia
**AlumiFort**): o cliente escolhe a chapa pelo tamanho, cor e grossura e faz o
pedido pelo site; o fornecedor gerencia o estoque, a fila de produção e — a
estrela do sistema — calcula os cortes **sem desperdício**.

## 💡 O exemplo que resume tudo

> Uma chapa de **90 cm** cortada em peças de **35,7 cm**: saem **2 peças** e o
> sistema já avisa que sobra **18,6 cm** para aproveitar em outro corte.

O motor vai além do corte simples: recebe uma lista de cortes (60, 50, 30, 25...)
e monta o **plano otimizado** (heurística First-Fit Decreasing, a mais usada na
indústria para corte unidimensional), dizendo quantas chapas usar, o que cortar
em cada uma e a sobra exata de cada chapa. Dá até para informar o **kerf**
(a espessura da lâmina da serra, que "come" material a cada corte).

## 🖥️ As três telas

| Aba | Quem usa | O que tem |
|-----|----------|-----------|
| 🏠 **Início** | todos | apresentação da empresa + vitrine de produtos (ilustrações em SVG) |
| 🛒 **Fazer pedido** | cliente | catálogo de **alumínio, MDF e HDF** com filtro por material; monta uma **lista de chapas** (cada uma com cor, grossura, medida e quantidade), vê a **simulação de corte ao vivo**, a estimativa de custo, e recebe um **código de acompanhamento** |
| 📦 **Acompanhar** | cliente | digita o código e vê o andamento: linha do tempo do status + **checklist item a item** do que já foi cortado |
| 🏭 **Fornecedor** | esquadria | **fila de pedidos** com barra de progresso e checklist (marca cada item conforme produz), fluxo de status (recebido → em produção → pronto → entregue), calculadora de corte, plano otimizado e **estoque** editável |

## 🛠️ Arquitetura (3 serviços + banco)

```
[Svelte] ──> [API .NET 8 + EF Core] ──> [PostgreSQL]
                     │
                     └──> [Motor de Corte — Python/FastAPI]
```

| Parte | Tecnologia | Papel |
|-------|-----------|-------|
| `frontend/` | **Svelte 4 + Vite** | site responsivo (as 3 abas) |
| `api-dotnet/` | **.NET 8** Minimal API + EF Core | catálogo, pedidos, estoque; serve o site e repassa cálculos ao motor |
| `motor-python/` | **Python + FastAPI** | toda a matemática de corte (processos do sistema) |
| banco | **PostgreSQL** | chapas, pedidos e estoque |

Por que separar o motor em Python? Os cálculos de corte são o "processo" que
mais evolui (dá para plugar otimização pesada depois) — isolado num
microsserviço, ele muda sem tocar no resto. E mostra integração entre
linguagens, como no mundo real.

## 🚀 Como rodar

### Com Docker (recomendado — sobe tudo com um comando)
```bash
docker compose up -d --build
# acesse http://localhost:5080
```

### Manualmente (para desenvolvimento)
```bash
# 1. Motor de corte
cd motor-python
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001

# 2. API .NET (precisa do SDK 8: https://dotnet.microsoft.com/download)
cd ../api-dotnet/CorteCerto.Api
dotnet run --urls http://localhost:5080

# 3. Front-end
cd ../../frontend
npm install && npm run dev   # http://localhost:5173 (proxy para :5080)
```

## 🧪 Testes

```bash
# Motor de corte (14 testes — inclui o exemplo 90 ÷ 35,7)
cd motor-python && pytest -v

# Front-end (validações, fluxo de status, frases da calculadora)
cd frontend && npm test

# API .NET (validações de negócio, xUnit) — via Docker se não tiver o SDK:
cd api-dotnet
docker run --rm -v "%cd%":/src -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test
```

## 🔌 API (resumo)

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/chapas` | catálogo (tamanho, cor, grossura, preço) |
| POST | `/api/pedidos` | cliente faz o pedido |
| GET | `/api/pedidos` | fornecedor vê a fila |
| PUT | `/api/pedidos/{id}/status` | avança o fluxo de produção |
| GET / POST | `/api/estoque` | consulta / atualiza o estoque |
| POST | `/api/corte` | peças + sobra de uma chapa |
| POST | `/api/corte/chapas-necessarias` | chapas para produzir N peças |
| POST | `/api/corte/plano` | plano otimizado para vários cortes |

O motor Python também expõe as suas rotas em `:8001` (`/corte`, `/plano`,
`/chapas-necessarias`) com documentação automática em `/docs`.

## 📁 Estrutura

```
cortecerto/
├── frontend/                 # Svelte: Início, Fazer pedido, Fornecedor
├── api-dotnet/
│   ├── CorteCerto.Api/       # Minimal API + EF Core + seed do catálogo
│   ├── CorteCerto.Tests/     # xUnit (validações de negócio)
│   └── Dockerfile            # front + API numa imagem só
├── motor-python/
│   ├── app/corte.py          # a matemática (100% testada)
│   ├── app/main.py           # FastAPI
│   └── tests/test_corte.py
├── docker-compose.yml        # db + motor + api
├── Jenkinsfile               # CI das três partes
└── README.md
```

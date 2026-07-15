# 💰 MetaGrana — controle seus gastos, alcance suas metas

Todo mundo quer comprar alguma coisa — um video game, um carro, um apartamento.
O problema é que sem **controle dos gastos**, a meta nunca chega. O MetaGrana
junta as duas pontas: você registra seus gastos mensais, define metas de compra
(com marca e modelo), e o sistema **busca sozinho, todos os dias, o menor preço
no Mercado Livre** — mostrando o link do anúncio para contato quando aparecer
uma boa oportunidade.

## 💡 O que ele faz

- **Gastos mensais** por categoria, com resumo do mês e total.
- **Metas de compra**: título, marca, modelo e valor alvo. Cada meta tem uma
  "caixinha" onde você registra quanto já guardou, com barra de progresso.
- **Caça-preços automático**: um agendador (APScheduler) roda **todo dia às 8h**
  consultando a API pública do Mercado Livre e gravando o menor preço no
  histórico. Também dá para buscar na hora, com um clique.
- **Alerta de queda de preço**: o sistema compara com a busca anterior e avisa
  quando o preço caiu (hora de comprar!).
- **🔥 Vitrine de promoções**: varre as categorias mais buscadas do Mercado
  Livre e mostra só anúncios com **desconto real** (preço original > atual),
  ordenados pelo maior desconto.
- **Dicas mensais com IA**: com uma chave da Anthropic configurada, o Claude
  analisa seus números reais (renda, gastos por categoria, metas) e gera
  conselhos personalizados. **Sem a chave, o app gera dicas por regras** — a
  experiência nunca quebra.

## 🛠️ Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Front-end | **Vue 3 + Vite** (pasta `frontend/`) | Composition API, reatividade elegante — o 2º framework mais usado |
| Back-end | **Python + FastAPI** | Validação automática, docs interativas em `/docs`, async nativo |
| Banco | **MongoDB** | Metas e gastos são documentos flexíveis — caso perfeito para NoSQL |
| Preços | **API do Mercado Livre** | Pública, sem chave, dados reais do Brasil |
| IA | API da Anthropic (Claude) | Dicas personalizadas; com fallback local por regras |
| Agendador | APScheduler | Busca diária de preços sem intervenção |
| Testes | Pytest | Toda a matemática financeira e o parse do Mercado Livre |

## 🚀 Como rodar

### Com Docker (recomendado)
```bash
docker compose up -d --build
# acesse http://localhost:8000  (painel)
# e http://localhost:8000/docs (documentação interativa da API)
```

### Manualmente
```bash
# 1. suba um MongoDB local (ou use o do docker-compose)
# 2. copie .env.example para .env se quiser configurar a IA
python -m venv .venv
.venv\Scripts\activate        # Windows  (use "source .venv/bin/activate" no Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --reload   # API em http://localhost:8000

# em outro terminal — o front Vue com recarga automática:
cd frontend
npm install
npm run dev                     # http://localhost:5173 (proxy para a API)
```

## 🧪 Testes

```bash
pytest -v                # back-end: finanças + Mercado Livre — 29 testes
cd frontend && npm test  # front-end: formatação, validação, variação de preço — 8 testes
```
Os testes cobrem a matemática financeira (resumo por categoria, progresso de
meta, quanto poupar por mês, saúde financeira, variação de preço) e a
integração com o Mercado Livre (montagem de URL e parse das ofertas) — tudo
função pura, sem precisar de banco nem de internet.

## 🔌 API (resumo)

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/api/gastos` | registra um gasto |
| GET | `/api/gastos?mes=2026-07` | lista gastos do mês |
| GET | `/api/gastos/resumo` | total + gastos por categoria |
| DELETE | `/api/gastos/{id}` | apaga um gasto |
| POST | `/api/metas` | cria meta (título, marca, modelo, valor alvo) |
| GET | `/api/metas` | metas com progresso e última oferta encontrada |
| POST | `/api/metas/{id}/guardar` | deposita na caixinha da meta |
| GET | `/api/metas/{id}/precos` | busca ofertas agora + histórico + variação |
| DELETE | `/api/metas/{id}` | apaga a meta e seu histórico |
| GET | `/api/dicas?renda=5000` | dicas do mês (IA ou regras) |

A documentação completa e interativa fica em **`/docs`** (gerada pelo FastAPI).

## 📁 Estrutura

```
metagrana/
├── app/
│   ├── main.py                  # API + agendador diário de preços
│   ├── db.py                    # conexão MongoDB
│   └── services/
│       ├── financas.py          # matemática financeira (100% testada)
│       ├── mercadolivre.py      # busca de menores preços
│       └── ia.py                # dicas com Claude + fallback por regras
├── frontend/                    # Vue 3 + Vite (Resumo, Gastos, Metas, Dicas)
├── tests/                       # pytest
├── Dockerfile / docker-compose.yml
└── Jenkinsfile                  # CI: deps → testes → imagem
```

## 🔮 Evoluções planejadas

- Contas de usuário (hoje é single-user, ideal para demonstração)
- Notificações por email/WhatsApp quando o preço cair X%
- Gráfico do histórico de preços de cada meta

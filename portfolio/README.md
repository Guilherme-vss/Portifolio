# 🌐 Portfólio — Site pessoal

Meu site de portfólio, feito com **HTML, CSS e JavaScript puros** — sem frameworks.
A escolha foi proposital: um portfólio estático carrega instantaneamente, funciona
no GitHub Pages de graça e mostra domínio dos fundamentos da web.

## ✨ O que ele faz

- **Apresentação pessoal** com bio e chamada para ação
- **Projetos em destaque** — cards dos 3 projetos deste repositório
- **Integração com a API do GitHub** — busca e exibe meus repositórios públicos
  automaticamente (ordenados por estrelas, ignorando forks)
- **Habilidades** organizadas por categoria
- **Contatos**: email, LinkedIn, GitHub e celular/WhatsApp
- **Totalmente responsivo** — menu hambúrguer no celular, grid fluido no desktop

## 🚀 Como rodar

### Opção 1 — Só abrir (é um site estático!)
Abra o `index.html` no navegador. Pronto.

### Opção 2 — Com Docker
```bash
docker compose up -d
# acesse http://localhost:8080
```

### Opção 3 — Servidor local com Node
```bash
npm install
npm start
# acesse http://localhost:3000
```

## ⚙️ Configuração

Os dados de contato já estão configurados:

- **`js/api.js`** — `GITHUB_USER = "Guilherme-vss"` (a página lista os repositórios dessa conta).
- **`index.html`** — GitHub, LinkedIn ([/in/guilherme-vss](https://www.linkedin.com/in/guilherme-vss))
  e WhatsApp ((11) 96122-1800) já apontam para os links reais.
- O que ainda falta personalizar: a seção **"Minha trajetória"** (procure por `EDITE-ME`).

## 🧪 Testes

A lógica de integração com o GitHub (montagem de URL, parse e ordenação dos
repositórios) fica isolada em `js/api.js` justamente para ser testável sem navegador:

```bash
npm install
npm test
```

## 📁 Estrutura

```
portfolio/
├── index.html          # página única com todas as seções
├── css/style.css       # estilos (mobile-first, tema escuro)
├── js/api.js           # integração com a API do GitHub (testável)
├── js/main.js          # interações de tela (menu, renderização)
├── tests/api.test.js   # testes unitários (Jest)
├── Dockerfile          # nginx servindo o site
├── docker-compose.yml
└── Jenkinsfile         # pipeline: instalar → testar → build Docker
```

## 🌍 Publicando no GitHub Pages

Veja o passo a passo completo em [`../TUTORIAL-GITHUB.md`](../TUTORIAL-GITHUB.md).
Resumo: Settings → Pages → Branch `main` → pasta `/portfolio` (ou use a raiz do
repositório se preferir um repositório só para o site).

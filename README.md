# 💼 Portfólio — Guilherme Souza

Bem-vindo! Este repositório reúne meu site de portfólio e **quatro projetos
completos**, cada um com linguagem, banco de dados e framework de front-end
diferentes — de propósito: a ideia é mostrar versatilidade de verdade, não a
mesma stack repetida.

## 📂 O que tem aqui

| Pasta | Projeto | Back-end | Front-end | Banco | API externa |
|-------|---------|----------|-----------|-------|-------------|
| [`portfolio/`](portfolio/) | 🌐 Site do portfólio | — | HTML/CSS/JS puros | — | GitHub |
| [`rotakids/`](rotakids/) | 🚐 RotaKids — vans escolares com rota otimizada | Node.js + TypeScript | **React 18** | PostgreSQL | OSRM + Nominatim |
| [`metagrana/`](metagrana/) | 💰 MetaGrana — gastos e metas de compra | Python + FastAPI | **Vue 3** | MongoDB | Mercado Livre + IA |
| [`planify/`](planify/) | 📊 Planify — organizador de planilhas (**DDD + DTO**) | Java 17 + Spring Boot | **Angular 17** | MySQL | ViaCEP |
| [`cortecerto/`](cortecerto/) | ✂️ CorteCerto — sistema para esquadrias | **.NET 8** + motor **Python** | **Svelte 4** | PostgreSQL | motor de corte próprio |

Cada aplicação tem **cor e ícone próprios**: RotaKids é azul 🔵, MetaGrana é
verde 🟢, Planify é roxo 🟣 e CorteCerto é laranja 🟠.

## 🧭 Por onde começar

1. **Nunca usou Docker ou Jenkins?** Leia o [TUTORIAL-DOCKER-JENKINS.md](TUTORIAL-DOCKER-JENKINS.md) —
   escrevi passo a passo, do zero, sem assumir que você já conhece.
2. **Quer subir tudo no GitHub?** O [TUTORIAL-GITHUB.md](TUTORIAL-GITHUB.md) explica como criar
   o repositório e publicar o portfólio no GitHub Pages de graça.
3. **Quer rodar um projeto?** Cada pasta tem seu próprio `README.md` com instruções completas —
   tanto para rodar com Docker (um comando só) quanto manualmente.

## 🛠️ O que todos os projetos têm em comum

- ✅ **Front-end de verdade** — React, Vue, Angular e Svelte (os 4 mais usados do mercado)
- ✅ **API externa consumida** — todos integram com algum serviço real
- ✅ **Banco de dados configurado** — PostgreSQL, MongoDB e MySQL
- ✅ **Docker + docker-compose** — sobe tudo com um comando
- ✅ **Jenkinsfile** — pipeline de CI pronto (deps → testes → imagens Docker)
- ✅ **Testes automatizados** — Jest, Vitest, Pytest, JUnit e xUnit (100+ testes)
- ✅ **Interface responsiva** — funciona no celular e no desktop
- ✅ **Documentação em português** — READMEs escritos para humanos

## 🚪 Portas de cada projeto (com Docker)

| Projeto | Endereço |
|---------|----------|
| portfolio | http://localhost:8080 |
| rotakids | http://localhost:3000 |
| metagrana | http://localhost:8000 (API docs em `/docs`) |
| planify | http://localhost:8081 |
| cortecerto | http://localhost:5080 |

## 📫 Contato

- **Email:** guilhermevsouza18@gmail.com
- **GitHub:** [github.com/SEU-USUARIO](https://github.com/SEU-USUARIO) *(troque pelo seu usuário)*
- **LinkedIn:** [linkedin.com/in/SEU-PERFIL](https://linkedin.com/in/SEU-PERFIL) *(troque pelo seu perfil)*

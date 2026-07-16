# 🚢 Registro — DevOps

Docker, CI/CD, deploy e publicação. Formato em [`README.md`](README.md).

---

## 2026-07-16 — Cada projeto em seu próprio repositório + Pages

- **O que mudou:** `gh` CLI instalado (winget) e autenticado. Criados 4 repos
  públicos com **histórico preservado** — usei `git subtree split --prefix <proj>`
  em vez de copiar arquivos, então cada repo nasceu com os commits daquele projeto
  (rotakids 6, metagrana 5, planify 5, cortecerto 4). Cada um ganhou seu próprio
  branch `gh-pages` (build do front + `.nojekyll`). O portfólio passou a apontar
  para os Pages e repos individuais.
- **O que foi testado:** monitor aguardando HTTP 200 em cada Pages + `gh repo list`.
- **Resultado:** ✅ os 4 no ar:
  `rotakids` · `metagrana` · `planify` · `cortecerto` → `guilherme-vss.github.io/<nome>/`
  (todos HTTP 200). Portfólio segue em `/Portifolio/` (200).
- **Pendências:** o monorepo `Portifolio` ainda contém as 4 pastas — a partir de
  agora, mudança em projeto vai no repo dele; o monorepo mantém só o portfólio e
  as demos. **Atenção:** a URL do Pages diferencia maiúsculas (`/Portifolio/`,
  não `/portifolio/`) — um 404 no meu teste veio disso, não do deploy.

## 2026-07-16 — Início do registro por área

- **O que mudou:** adoção do [REGRAS.md](../REGRAS.md).
- **O que foi testado:** nada (mudança de processo).
- **Resultado:** —
- **Pendências:** entradas anteriores estão só no histórico do Git.

## 2026-07-15 — Publicação da versão com as evoluções

- **O que mudou:** `build-docs.ps1` recompilou os 4 fronts e montou `docs/`;
  commit `47a206d` no `master`; `gh-pages` republicado (`6d2a6f6..81425a8`).
- **O que foi testado:** monitor aguardando o conteúdo novo responder no ar +
  checagem do site publicado.
- **Resultado:** ✅ `https://guilherme-vss.github.io/Portifolio/` no ar com a nova
  versão (CorteCerto "MadeiraFort" e Planify com análise confirmados ao vivo).
- **Pendências:** nenhuma.

## 2026-07-14 — GitHub Pages ativado sem tocar em Settings

- **O que mudou:** o Pages foi ativado **automaticamente** pela criação do branch
  `gh-pages` (`git subtree split --prefix docs`) — sem mexer na configuração do
  repositório. `publicar-site.ps1` criado para repetir o ciclo com um comando.
- **O que foi testado:** deploy real + navegação no site publicado.
- **Resultado:** ✅ site no ar; fluxo documentado no `TUTORIAL-GITHUB.md`.
- **Pendências:** nenhuma.

## Ambiente desta máquina (limitações conhecidas)

Registro honesto do que **não** dá para verificar localmente hoje:

| Ferramenta | Situação | Impacto |
|-----------|----------|---------|
| Node.js 24 | ✅ instalado | testes e builds dos 4 fronts rodam |
| Python 3.11 | ✅ instalado | pytest do MetaGrana e do motor de corte rodam |
| Java 17 | ✅ instalado | Planify compila e testa (Maven baixado no scratchpad) |
| **Docker** | ❌ ausente | `docker compose` e os testes .NET via container **não rodam aqui** |
| **.NET SDK** | ❌ ausente | `dotnet test` do CorteCerto só roda no CI |
| Maven | ⚠️ não instalado | usado a partir de download temporário |

**Consequência assumida:** a API .NET e os `docker-compose` são verificados por
revisão de código e pelo pipeline — não por execução local. Isso é dito
explicitamente sempre que a entrega envolve essas partes (regra 3: se não
verifiquei, eu digo).

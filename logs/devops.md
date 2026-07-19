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

## 2026-07-18 — RotaKids: trânsito TomTom publicado ao vivo + fix do Render

- **Segurança:** o Guilherme colou a chave real no `config.local.js.exemplo`
  (que NÃO é gitignorado). Verifiquei com `git log -S`: a chave **não** entrou em
  nenhum commit (estava só na árvore de trabalho). Movi para o `config.local.js`
  correto (gitignorado, confirmado por `git check-ignore`) e restaurei o `.exemplo`.
- **Fix do Render (comprovado):** o 1º deploy falhou porque o `render.yaml` tinha
  `NODE_ENV=production` + `npm install` puro → o npm pulava as devDependencies e o
  `typescript`/`tsc` sumia no build. Simulei o ambiente do Render numa pasta
  isolada: sem `--include=dev` o typescript ficava ausente; com a flag, presente e
  `npm run build` gerou `dist/index.js`. Corrigido para `npm install --include=dev`.
  Commit `b85cd57` — o Guilherme refaz o Manual Deploy.
- **Trânsito ao vivo:** build do rotakids feito COM o `config.local.js` (chave) e
  publicado só no branch **gh-pages do repo rotakids** — a chave entra no site
  servido, nunca no código-fonte (master). É domain-restricted a
  guilherme-vss.github.io, então mesmo pública no build só funciona lá.
- **O que foi testado:** build com a chave → `dist/config.local.js` presente;
  deploy no gh-pages; **verificação no site AO VIVO** (guilherme-vss.github.io/
  rotakids/): 12 telhas `api.tomtom.com/traffic/...` com `naturalWidth>0`
  (carregadas de verdade, 0 quebradas) — a chave domain-restricted é aceita.
  Confirmado visualmente: ruas verde/amarelo/vermelho sobre o mapa.
- **Resultado:** ✅ chave segura, Render corrigido, **trânsito ao vivo publicado
  e verificado**.
- **Pendências:** Guilherme refaz o deploy do Render e passa a URL (aí ligo o
  `__API_URL__` e publico o rastreamento ao vivo).

## 2026-07-18 — RotaKids: preparado para deploy no Render

- **O que mudou:** o backend ficou deploy-ready no Render (usuário já tem conta):
  - `render.yaml` (Blueprint): cria web service Node + PostgreSQL free e injeta
    a `DATABASE_URL` sozinho; `JWT_SECRET` via `generateValue` (nunca versionado).
  - `db.ts`: SSL automático quando a URL é do Render; `inicializarEsquema()`
    roda o `init.sql` no boot (no Render não há entrypoint do Postgres).
    `index.ts` sobe o servidor só após o banco estar pronto (falha alto se não).
  - `Dockerfile`: passou a copiar `db/` (o boot lê o init.sql).
  - CORS restrito aos domínios conhecidos (guilherme-vss.github.io + localhost),
    não "*" — a API lida com dados de crianças.
  - Front: `api.js` só usa o backend real quando há `window.__API_URL__` ou
    `?api=` na URL; senão mantém o motor local. **Decisão (3 frentes):** demo
    padrão fica instantânea (Render free hiberna ~50s); o backend é para mostrar
    o rastreamento ao vivo entre dispositivos quando quiser.
  - `README-DEPLOY.md`: passo a passo do TomTom e do Render + tabela de segredos.
- **O que foi testado:** `npm test` (87, +2 de boot com pg-mem rodando o init.sql;
  idempotência verificada por checagem estática do IF NOT EXISTS — pg-mem não
  simula bem o re-run, mas o Postgres real honra); builds back e front limpos;
  smoke test no navegador (motor local segue como padrão, sem erro no console).
- **Resultado:** ✅ 87 testes, deploy-ready. O deploy em si depende do login do
  Guilherme no Render (não consigo fazer por ele).
- **Pendências:** Guilherme roda o Blueprint no Render e me passa a URL; aí ligo
  o front (`__API_URL__`) e publico. `render.yaml` NÃO roda .NET/Java — é só do
  RotaKids; os outros seguem com motor local por ora.

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

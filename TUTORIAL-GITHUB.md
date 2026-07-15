# 🐙 Tutorial: subindo tudo no GitHub (e publicando o portfólio de graça)

## Passo 0 — Pré-requisitos

- Conta no GitHub: https://github.com/signup
- Git instalado: https://git-scm.com/download/win (instale com as opções padrão)
- Confira no PowerShell: `git --version`

Configure seu nome e email (só na primeira vez):
```powershell
git config --global user.name "Guilherme Souza"
git config --global user.email "guilhermevsouza18@gmail.com"
```

## Passo 1 — Criar o repositório no GitHub

1. Acesse https://github.com/new
2. **Repository name**: `portfolio` (ou o nome que preferir)
3. Deixe **Public** (recrutadores precisam ver!)
4. **NÃO** marque "Add a README" (nós já temos um)
5. **Create repository**

## Passo 2 — Enviar o código

No PowerShell, dentro da pasta `Portifolio`:

```powershell
cd C:\Users\Guizi\Downloads\Portifolio

git init
git add .
git commit -m "Portfólio completo: site + RotaKids + MetaGrana + Planify"
git branch -M main
git remote add origin https://github.com/Guilherme-vss/Portifolio.git
git push -u origin main
```

> Na primeira vez, o Git abre uma janela pedindo para logar no GitHub — use
> a opção do navegador, é a mais fácil.

Pronto! Atualize a página do repositório e veja tudo lá. 🎉

## Passo 3 — Publicar o site do portfólio no GitHub Pages (grátis!)

1. No repositório: **Settings** → **Pages** (menu lateral)
2. Em **Source**: escolha `Deploy from a branch`
3. **Branch**: `main` — **Folder**: `/ (root)` → **Save**
4. Aguarde 1–2 minutos. Seu site estará em:
   `https://guilherme-vss.github.io/Portifolio/portfolio/`

> 💡 O endereço termina com `/portfolio/` duas vezes porque o site está dentro
> da pasta `portfolio/` do repositório. Se quiser um endereço mais limpo
> (`https://guilherme-vss.github.io`), crie um repositório separado chamado
> exatamente `guilherme-vss.github.io` e coloque nele só o conteúdo da pasta
> `portfolio/`.

## Passo 4 — Antes de divulgar, personalize!

Procure por `SEU-USUARIO` e `SEU-PERFIL` nos arquivos e troque pelos seus dados:

- `portfolio/js/api.js` → seu usuário do GitHub (para a API buscar SEUS repositórios)
- `portfolio/index.html` → links do GitHub, LinkedIn e o número do WhatsApp
- `README.md` (raiz) → links de contato

Depois é só commitar de novo:
```powershell
git add .
git commit -m "Personaliza dados de contato"
git push
```

## Dia a dia com o Git (cola rápida)

```powershell
git status                      # o que mudou?
git add .                       # prepara tudo para o commit
git commit -m "mensagem clara"  # salva um ponto na história
git push                        # envia para o GitHub
git pull                        # traz o que está no GitHub
git log --oneline               # histórico resumido
```

**Dica de ouro para o portfólio:** commits pequenos e mensagens descritivas
("Adiciona cálculo de rota no RotaKids") mostram profissionalismo — recrutador
técnico olha o histórico!

# ============================================================
# publicar-site.ps1 — atualiza o site publicado no GitHub Pages
#
# O Pages serve o branch gh-pages (que é o conteúdo da pasta docs/).
# Este script faz o ciclo completo: recompila as demos, commita no
# master e republica o gh-pages. Rode depois de qualquer mudança.
# ============================================================

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "1/3 🔨 Reconstruindo a pasta docs/ ..."
powershell -ExecutionPolicy Bypass -File .\build-docs.ps1

Write-Host "2/3 💾 Commitando no master ..."
git add .
git commit -m "Atualiza site publicado (docs/)" 2>$null
git push origin master

Write-Host "3/3 🚀 Republicando o branch gh-pages ..."
git branch -D gh-pages 2>$null
git subtree split --prefix docs -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages

Write-Host "✅ Publicado! O site atualiza em ~1 minuto: https://guilherme-vss.github.io/Portifolio/"

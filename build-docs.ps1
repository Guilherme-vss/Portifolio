# ============================================================
# build-docs.ps1 — monta a pasta docs/ publicada no GitHub Pages
#
# docs/            → o site do portfólio
# docs/demos/...   → cada front-end compilado em modo demonstração
#
# Rode este script sempre que mudar o portfólio ou algum front-end,
# depois faça commit + push. Requer Node.js instalado.
# ============================================================

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot
$docs = Join-Path $raiz "docs"

Write-Host "🧹 Limpando docs/ ..."
if (Test-Path $docs) { Remove-Item $docs -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $docs "demos") | Out-Null

Write-Host "🌐 Copiando o site do portfólio ..."
Copy-Item (Join-Path $raiz "portfolio\index.html") $docs
Copy-Item (Join-Path $raiz "portfolio\icone.svg") $docs
Copy-Item (Join-Path $raiz "portfolio\css") $docs -Recurse
Copy-Item (Join-Path $raiz "portfolio\js") $docs -Recurse

# nome do projeto → (pasta do front, subpasta do build)
$demos = @(
    @{ nome = "rotakids";   fonte = "rotakids\frontend";   saida = "dist" },
    @{ nome = "metagrana";  fonte = "metagrana\frontend";  saida = "dist" },
    @{ nome = "planify";    fonte = "planify\frontend";    saida = "dist\browser" },
    @{ nome = "cortecerto"; fonte = "cortecerto\frontend"; saida = "dist" }
)

foreach ($demo in $demos) {
    Write-Host "⚙️  Compilando a demo de $($demo.nome) ..."
    Push-Location (Join-Path $raiz $demo.fonte)
    if (-not (Test-Path "node_modules")) { npm install --no-fund --no-audit | Out-Null }
    npm run build | Out-Null
    Pop-Location

    $origem  = Join-Path $raiz "$($demo.fonte)\$($demo.saida)"
    $destino = Join-Path $docs "demos\$($demo.nome)"
    Copy-Item $origem $destino -Recurse
}

Write-Host "✅ docs/ pronta! Faça commit + push e o GitHub Pages publica em ~1 minuto."

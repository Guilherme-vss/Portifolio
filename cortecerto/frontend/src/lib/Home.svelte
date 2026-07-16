<script>
  /** Página inicial: apresentação da marcenaria + como funciona o corte. */
  import CorteVisual from "./CorteVisual.svelte";

  export let irParaPedido;

  const produtos = [
    {
      nome: "Portas de MDF sob medida",
      descricao: "Lisas ou ripadas, em qualquer cor da linha, com usinagem para dobradiças.",
      tipo: "porta",
    },
    {
      nome: "Painéis ripados",
      descricao: "MDF Carvalho, Nogueira ou Preto — o queridinho das salas e varandas.",
      tipo: "painel",
    },
    {
      nome: "Fundos e tamponamentos em HDF",
      descricao: "HDF 3mm cru ou branco para fundos de armário, gavetas e nichos.",
      tipo: "hdf",
    },
    {
      nome: "Chapas cortadas na medida",
      descricao: "MDF, HDF e compensado no corte exato do seu projeto, sem desperdício.",
      tipo: "chapa",
    },
  ];
</script>

<section class="hero">
  <h1>Chapas de madeira <span>na medida certa</span></h1>
  <p>
    Há 20 anos a MadeiraFort corta <strong>MDF, HDF e compensado</strong> sob
    medida — são dezenas de combinações de cor e grossura, e vários cortes no
    mesmo pedido. Com o sistema <strong>CorteCerto</strong>, você monta sua
    lista de chapas, recebe um código e acompanha a produção item a item,
    enquanto nosso motor de cálculo planeja tudo sem desperdício.
  </p>
  <div class="selos">
    <span>🪚 Corte computadorizado</span>
    <span>📏 Medidas exatas</span>
    <span>♻️ Mínimo desperdício</span>
    <span>🚚 Entrega em toda a região</span>
  </div>
  <button on:click={irParaPedido}>🛒 Fazer meu pedido agora</button>
</section>

<section class="card">
  <h2>👀 Como funciona o corte — exemplo real</h2>
  <p class="dica">
    Você pede peças de <strong>35,7 cm</strong> numa chapa de <strong>90 cm</strong>:
    a serra tira <strong>2 peças</strong> e o sistema já mostra que sobram
    <strong>18,6 cm</strong> — sobra que pode virar a peça de outro corte.
    É exatamente assim que o desenho chega para o operador da serra:
  </p>
  <CorteVisual tamanhoChapa={90} cortes={[35.7, 35.7]} sobra={18.6} cor="#b98a4e" />
  <p class="dica" style="margin-top:0.5rem">
    ✂️ = linha da serra &nbsp;•&nbsp; área hachurada = sobra aproveitável.
    Na aba <strong>Fornecedor</strong> esse desenho é gerado ao vivo para
    qualquer medida que você digitar.
  </p>
</section>

<section>
  <h2 style="margin-bottom: 0.9rem">Nossos produtos</h2>
  <div class="produtos">
    {#each produtos as produto}
      <article class="produto">
        <!-- Ilustrações em SVG: leves, nítidas em qualquer tela e sem depender de fotos -->
        {#if produto.tipo === "porta"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#f1ede6"/>
            <rect x="78" y="8" width="64" height="118" rx="4" fill="#b98a4e"/>
            <rect x="78" y="8" width="64" height="118" rx="4" fill="none" stroke="#7c4a12" stroke-width="2"/>
            <rect x="86" y="18" width="48" height="44" rx="2" fill="none" stroke="#7c4a12" stroke-width="2"/>
            <rect x="86" y="70" width="48" height="44" rx="2" fill="none" stroke="#7c4a12" stroke-width="2"/>
            <circle cx="132" cy="68" r="4" fill="#3b2508"/>
          </svg>
        {:else if produto.tipo === "painel"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#f1ede6"/>
            {#each Array(11) as _, i}
              <rect x={18 + i * 17} y="12" width="10" height="106" rx="3"
                    fill={i % 2 ? "#8a5a2b" : "#a86f3a"}/>
            {/each}
          </svg>
        {:else if produto.tipo === "hdf"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#f1ede6"/>
            <rect x="30" y="22" width="130" height="86" rx="3" fill="#caa06a"/>
            <rect x="48" y="34" width="130" height="86" rx="3" fill="#e8ddca" stroke="#b08d55" stroke-width="1.5"/>
            <rect x="66" y="14" width="130" height="86" rx="3" fill="#f2efe8" stroke="#b08d55" stroke-width="1.5"
                  transform="rotate(4 66 14)"/>
            <text x="128" y="66" font-family="Segoe UI, sans-serif" font-size="13" fill="#6b4a2b" text-anchor="middle">HDF 3mm</text>
          </svg>
        {:else}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#f1ede6"/>
            <rect x="25" y="30" width="170" height="70" rx="4" fill="#b98a4e"/>
            <rect x="25" y="30" width="170" height="70" rx="4" fill="none" stroke="#7c4a12" stroke-width="2"/>
            <line x1="88" y1="30" x2="88" y2="100" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 5"/>
            <line x1="151" y1="30" x2="151" y2="100" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 5"/>
            <text x="53" y="70" font-family="Segoe UI, sans-serif" font-size="13" fill="#3b2508" text-anchor="middle">35,7</text>
            <text x="119" y="70" font-family="Segoe UI, sans-serif" font-size="13" fill="#3b2508" text-anchor="middle">35,7</text>
            <text x="184" y="70" font-family="Segoe UI, sans-serif" font-size="12" fill="#9a3412" text-anchor="middle">sobra</text>
          </svg>
        {/if}
        <div class="produto__info">
          <h3>{produto.nome}</h3>
          <p>{produto.descricao}</p>
        </div>
      </article>
    {/each}
  </div>
</section>

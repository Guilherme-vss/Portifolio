<script>
  /** Página inicial: apresentação da empresa + vitrine de produtos (fictícios). */
  export let irParaPedido;

  const produtos = [
    {
      nome: "Janela de Correr 2 Folhas",
      descricao: "Alumínio anodizado, vidro liso 4mm, roldanas de nylon.",
      tipo: "janela",
    },
    {
      nome: "Porta de Giro com Lambri",
      descricao: "Linha suprema 2.0mm, fechadura embutida, sob medida.",
      tipo: "porta",
    },
    {
      nome: "Box de Banheiro Frontal",
      descricao: "Vidro temperado 8mm incolor ou fumê, kit completo.",
      tipo: "box",
    },
    {
      nome: "Chapas sob medida",
      descricao: "Corte na medida exata com aproveitamento máximo da chapa.",
      tipo: "chapa",
    },
  ];
</script>

<section class="hero">
  <h1>Esquadrias e chapas <span>na medida certa</span></h1>
  <p>
    Há 20 anos a AlumiFort fabrica janelas, portas e box sob medida — e corta
    chapas de <strong>alumínio, MDF e HDF</strong> em várias cores e grossuras.
    Com o sistema <strong>CorteCerto</strong>, você monta sua lista de cortes,
    recebe um código e acompanha a produção item a item, enquanto nosso motor
    de cálculo planeja tudo sem desperdício.
  </p>
  <div class="selos">
    <span>✂️ Corte computadorizado</span>
    <span>📏 Medidas exatas</span>
    <span>♻️ Mínimo desperdício</span>
    <span>🚚 Entrega em toda a região</span>
  </div>
  <button on:click={irParaPedido}>🛒 Fazer meu pedido agora</button>
</section>

<section>
  <h2 style="margin-bottom: 0.9rem">Nossos produtos</h2>
  <div class="produtos">
    {#each produtos as produto}
      <article class="produto">
        <!-- Ilustrações em SVG: leves, nítidas em qualquer tela e sem depender de fotos -->
        {#if produto.tipo === "janela"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#e2e8f0"/>
            <rect x="30" y="15" width="160" height="100" rx="4" fill="#475569"/>
            <rect x="38" y="23" width="70" height="84" fill="#bae6fd"/>
            <rect x="112" y="23" width="70" height="84" fill="#7dd3fc"/>
            <rect x="106" y="23" width="6" height="84" fill="#334155"/>
            <rect x="70" y="60" width="4" height="14" rx="2" fill="#0f172a"/>
          </svg>
        {:else if produto.tipo === "porta"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#e2e8f0"/>
            <rect x="75" y="8" width="70" height="118" rx="4" fill="#475569"/>
            <rect x="83" y="16" width="54" height="55" fill="#bae6fd"/>
            <rect x="83" y="78" width="54" height="10" rx="2" fill="#94a3b8"/>
            <rect x="83" y="93" width="54" height="10" rx="2" fill="#94a3b8"/>
            <rect x="83" y="108" width="54" height="10" rx="2" fill="#94a3b8"/>
            <circle cx="132" cy="68" r="4" fill="#f8fafc"/>
          </svg>
        {:else if produto.tipo === "box"}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#e2e8f0"/>
            <rect x="25" y="12" width="170" height="8" rx="3" fill="#475569"/>
            <rect x="35" y="20" width="72" height="102" fill="#a5f3fc" opacity="0.75"/>
            <rect x="112" y="20" width="72" height="102" fill="#cffafe" opacity="0.75"/>
            <rect x="107" y="20" width="6" height="102" fill="#475569"/>
            <rect x="96" y="64" width="4" height="16" rx="2" fill="#0f172a"/>
          </svg>
        {:else}
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
            <rect width="220" height="130" fill="#e2e8f0"/>
            <rect x="25" y="30" width="170" height="70" rx="4" fill="#c0c5cc"/>
            <rect x="25" y="30" width="170" height="70" rx="4" fill="none" stroke="#64748b" stroke-width="2"/>
            <line x1="88" y1="30" x2="88" y2="100" stroke="#ea580c" stroke-width="3" stroke-dasharray="7 5"/>
            <line x1="151" y1="30" x2="151" y2="100" stroke="#ea580c" stroke-width="3" stroke-dasharray="7 5"/>
            <text x="53" y="70" font-family="Segoe UI, sans-serif" font-size="13" fill="#334155" text-anchor="middle">35,7</text>
            <text x="119" y="70" font-family="Segoe UI, sans-serif" font-size="13" fill="#334155" text-anchor="middle">35,7</text>
            <text x="184" y="70" font-family="Segoe UI, sans-serif" font-size="12" fill="#ea580c" text-anchor="middle">sobra</text>
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

<section class="card">
  <h2>Por que "corte certo"?</h2>
  <p class="dica">
    Uma chapa de 90 cm cortada em duas peças de 35,7 cm deixa exatamente
    <strong>18,6 cm de sobra</strong> — e o nosso sistema sabe disso antes da serra
    ligar. Planejando todos os cortes juntos, a sobra de um pedido vira a peça
    do próximo. Menos sucata, mais economia para você.
  </p>
</section>

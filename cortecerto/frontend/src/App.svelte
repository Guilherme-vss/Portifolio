<script>
  /**
   * App.svelte — casca do site.
   *
   * Duas áreas separadas por quem usa:
   *   PÚBLICO   Início · Fazer pedido · Acompanhar  (cliente)
   *   INTERNO   Painel do dono (CRM) · Chão de fábrica (produtor) · Estoque
   *
   * O menu interno fica atrás de um botão "Área interna" — o cliente não
   * precisa ver, e separa visualmente quem vende de quem produz.
   */
  import Home from "./lib/Home.svelte";
  import Pedido from "./lib/Pedido.svelte";
  import Acompanhar from "./lib/Acompanhar.svelte";
  import Fornecedor from "./lib/Fornecedor.svelte";
  import Dono from "./lib/Dono.svelte";
  import Produtor from "./lib/Produtor.svelte";

  let aba = "inicio";
  let areaInterna = false;

  const abasPublicas = [
    { id: "inicio", rotulo: "🏠 Início" },
    { id: "pedido", rotulo: "🛒 Fazer pedido" },
    { id: "acompanhar", rotulo: "📦 Acompanhar" },
  ];
  const abasInternas = [
    { id: "dono", rotulo: "💼 Painel do dono" },
    { id: "produtor", rotulo: "🏭 Chão de fábrica" },
    { id: "estoque", rotulo: "📦 Estoque & cortes" },
  ];

  $: abas = areaInterna ? abasInternas : abasPublicas;

  function alternarArea() {
    areaInterna = !areaInterna;
    aba = areaInterna ? "dono" : "inicio";
  }
</script>

<nav class="navbar">
  <div class="navbar__marca">
    <img src="icone.svg" alt="" />
    <div>
      <strong>MadeiraFort Esquadrias</strong>
      <small>MDF • HDF • compensado — corte certo, sem desperdício</small>
    </div>
  </div>
  <div class="navbar__abas">
    {#each abas as item}
      <button class:ativa={aba === item.id} on:click={() => (aba = item.id)}>
        {item.rotulo}
      </button>
    {/each}
    <button class="navbar__area" on:click={alternarArea}>
      {areaInterna ? "👋 Sair da área interna" : "🔒 Área interna"}
    </button>
  </div>
</nav>

<main class="conteudo">
  {#if aba === "inicio"}
    <Home irParaPedido={() => (aba = "pedido")} />
  {:else if aba === "pedido"}
    <Pedido />
  {:else if aba === "acompanhar"}
    <Acompanhar />
  {:else if aba === "dono"}
    <Dono />
  {:else if aba === "produtor"}
    <Produtor />
  {:else if aba === "estoque"}
    <Fornecedor />
  {/if}
</main>

<footer class="rodape">
  MadeiraFort Esquadrias (empresa fictícia) — sistema CorteCerto:
  .NET 8 + Python + Svelte + PostgreSQL.
</footer>

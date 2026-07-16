<script>
  /**
   * App.svelte — casca do site: barra de navegação + troca de abas.
   * Início (empresa) | Fazer pedido (cliente) | Fornecedor (produção)
   */
  import Home from "./lib/Home.svelte";
  import Pedido from "./lib/Pedido.svelte";
  import Acompanhar from "./lib/Acompanhar.svelte";
  import Fornecedor from "./lib/Fornecedor.svelte";

  let aba = "inicio";

  const abas = [
    { id: "inicio", rotulo: "🏠 Início" },
    { id: "pedido", rotulo: "🛒 Fazer pedido" },
    { id: "acompanhar", rotulo: "📦 Acompanhar" },
    { id: "fornecedor", rotulo: "🏭 Fornecedor" },
  ];
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
  </div>
</nav>

<main class="conteudo">
  {#if aba === "inicio"}
    <Home irParaPedido={() => (aba = "pedido")} />
  {:else if aba === "pedido"}
    <Pedido />
  {:else if aba === "acompanhar"}
    <Acompanhar />
  {:else}
    <Fornecedor />
  {/if}
</main>

<footer class="rodape">
  MadeiraFort Esquadrias (empresa fictícia) — sistema CorteCerto:
  .NET 8 + Python + Svelte + PostgreSQL.
</footer>

<script>
  /**
   * Produtor.svelte — a tela do chão de fábrica, feita para um MONITOR na parede.
   *
   * Quem corta a chapa não quer ler texto pequeno: quer ver o pedido, pegar,
   * cortar e marcar pronto. Então aqui tudo é grande, com o desenho da placa
   * (com a sobra, que aqui PODE ser vista) e um jeito de dizer "cortei mais
   * peças do que o pedido" — porque a serra às vezes rende, e essa peça extra
   * não pode sumir do controle.
   */
  import { onMount } from "svelte";
  import { api, real } from "./api.js";
  import CorteVisual from "./CorteVisual.svelte";

  let pedidos = [];
  let funcionarios = [];
  let quemCorta = null; // funcionário selecionado (para creditar a produção)
  let pedidoAberto = null;
  let extras = {}; // itemId -> peças cortadas a mais

  async function carregar() {
    [pedidos, funcionarios] = await Promise.all([api("/pedidos"), api("/funcionarios")]);
    if (!quemCorta && funcionarios.length) quemCorta = funcionarios[0].id;
  }
  onMount(carregar);

  // Fila do produtor: só o que ainda tem peça para cortar.
  $: fila = pedidos
    .filter((p) => ["recebido", "em_producao"].includes(p.status))
    .map((p) => ({
      ...p,
      pendentes: p.itens.filter((i) => !i.feito).length,
      total: p.itens.length,
    }));

  async function marcarFeito(pedido, item) {
    const extra = Number(extras[item.id] ?? 0);
    const pecasCortadas = item.quantidadePecas + extra;
    await api(`/pedidos/${pedido.id}/itens/${item.id}/feito`, {
      metodo: "PUT",
      corpo: { feito: true, funcionarioId: quemCorta, pecasCortadas },
    });
    // Se todos os itens ficaram prontos, o pedido vira "pronto".
    const atualizado = (await api("/pedidos")).find((p) => p.id === pedido.id);
    if (atualizado.itens.every((i) => i.feito) && atualizado.status !== "pronto") {
      await api(`/pedidos/${pedido.id}/status`, { metodo: "PUT", corpo: { status: "pronto" } });
    }
    delete extras[item.id];
    carregar();
  }

  const pecasPorChapa = (item) => Math.max(1, Math.floor(item.chapa.tamanhoCm / item.medidaCorteCm));
  const sobraDoItem = (item) =>
    Math.round((item.chapa.tamanhoCm - pecasPorChapa(item) * item.medidaCorteCm) * 100) / 100;
</script>

<section class="card produtor-topo">
  <div>
    <h2>🏭 Chão de fábrica</h2>
    <p class="dica">Pegue um pedido, corte e marque pronto. Se sobrar peça boa, registre.</p>
  </div>
  <label class="quem-corta">
    Quem está cortando:
    <select bind:value={quemCorta}>
      {#each funcionarios.filter((f) => f.ativo) as f}
        <option value={f.id}>{f.nome}</option>
      {/each}
    </select>
  </label>
</section>

{#if fila.length === 0}
  <section class="card centro">
    <h2>✅ Fila vazia!</h2>
    <p class="dica">Nenhum pedido esperando corte. Bom trabalho, equipe!</p>
  </section>
{/if}

{#each fila as pedido (pedido.id)}
  <section class="card pedido-producao">
    <button class="pedido-cabecalho" on:click={() => (pedidoAberto = pedidoAberto === pedido.id ? null : pedido.id)}>
      <div>
        <strong>{pedido.codigo}</strong> · {pedido.nomeCliente}
        <span class="dica">— {pedido.pendentes} de {pedido.total} item(ns) a cortar</span>
      </div>
      <span class="chevron">{pedidoAberto === pedido.id ? "▲" : "▼ abrir"}</span>
    </button>

    {#if pedido.observacao}
      <p class="obs">📝 {pedido.observacao}</p>
    {/if}

    {#if pedidoAberto === pedido.id}
      {#each pedido.itens as item (item.id)}
        <div class="item-corte" class:feito={item.feito}>
          <div class="item-corte__cabecalho">
            <span>
              <span class="bolinha" style="background: {item.chapa.corHex}"></span>
              <strong>{item.chapa.nome}</strong> · {item.chapa.material} {item.chapa.espessuraMm}mm
            </span>
            <strong>{item.quantidadePecas}× {item.medidaCorteCm} cm</strong>
          </div>

          {#if !item.feito}
            <!-- O desenho da placa, GRANDE, com a sobra (visão do produtor) -->
            <CorteVisual
              tamanhoChapa={item.chapa.tamanhoCm}
              cortes={Array(pecasPorChapa(item)).fill(item.medidaCorteCm)}
              sobra={sobraDoItem(item)}
              cor={item.chapa.corHex}
              mostrarSobra={true}
              grande={true}
            />

            <div class="item-corte__acoes">
              <label class="extra">
                Cortei peças a mais?
                <input type="number" min="0" placeholder="0" bind:value={extras[item.id]} />
              </label>
              <button class="grande verde" on:click={() => marcarFeito(pedido, item)}>
                ✅ Cortei este item
              </button>
            </div>
          {:else}
            <p class="feito-msg">
              ✅ Cortado{item.pecasCortadas > item.quantidadePecas
                ? ` — ${item.pecasCortadas} peças (${item.pecasCortadas - item.quantidadePecas} a mais no estoque)`
                : ""}
            </p>
          {/if}
        </div>
      {/each}
    {/if}
  </section>
{/each}

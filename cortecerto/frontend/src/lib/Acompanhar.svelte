<script>
  /**
   * Área do CLIENTE (pós-venda): digita o código recebido no pedido
   * e acompanha o andamento da produção item a item.
   */
  import { api, progressoDoPedido, statusInfo } from "./api.js";

  const fluxo = ["recebido", "em_producao", "pronto", "entregue"];

  let codigo = "";
  let pedido = null;
  let msg = "";
  let buscando = false;

  async function buscar() {
    msg = "";
    pedido = null;
    if (!codigo.trim()) {
      msg = "Digite o código que você recebeu ao fazer o pedido (ex.: MF-3F9K2)";
      return;
    }
    buscando = true;
    try {
      pedido = await api("/pedidos/acompanhar/" + encodeURIComponent(codigo.trim().toUpperCase()));
    } catch (falha) {
      msg = falha.message;
    } finally {
      buscando = false;
    }
  }

  $: indiceStatus = pedido ? fluxo.indexOf(pedido.status) : -1;
</script>

<section class="card">
  <h2>📦 Acompanhe seu pedido</h2>
  <p class="dica">Digite o código que você recebeu ao enviar o pedido — sem cadastro, sem senha.</p>

  <div style="display:flex;gap:0.6rem;align-items:flex-end;flex-wrap:wrap">
    <div style="flex:1;min-width:200px">
      <label for="codigo">Código de acompanhamento</label>
      <input id="codigo" placeholder="MF-XXXXX" bind:value={codigo}
             on:keydown={(e) => e.key === "Enter" && buscar()}
             style="text-transform:uppercase" />
    </div>
    <button on:click={buscar} disabled={buscando}>{buscando ? "Buscando..." : "🔎 Buscar"}</button>
  </div>
  <p class="msg erro">{msg}</p>

  {#if pedido}
    <div class="resultado" style="margin-top:1rem">
      Olá, <strong>{pedido.nomeCliente}</strong>! Seu pedido <strong>{pedido.codigo}</strong>
      está: <strong>{statusInfo(pedido.status).rotulo}</strong>
    </div>

    <div class="etapas">
      {#each fluxo as etapa, i}
        <span class:feita={i <= indiceStatus}>{statusInfo(etapa).rotulo}</span>
      {/each}
    </div>

    <div class="progresso"><div style="width: {progressoDoPedido(pedido)}%"></div></div>
    <small class="dica">
      {progressoDoPedido(pedido)}% da produção concluída
      ({pedido.itens.filter((item) => item.feito).length} de {pedido.itens.length} itens cortados)
    </small>

    <div class="tabela-wrap" style="margin-top:0.8rem">
      <table>
        <thead>
          <tr><th>Situação</th><th>Chapa</th><th>Material</th><th>Corte</th></tr>
        </thead>
        <tbody>
          {#each pedido.itens as item (item.id)}
            <tr>
              <td>{item.feito ? "✅ cortado" : "⏳ na fila"}</td>
              <td>
                <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:{item.chapa?.corHex};border:1px solid rgba(0,0,0,0.15);vertical-align:-1px"></span>
                {item.chapa?.nome}
              </td>
              <td>{item.chapa?.material}</td>
              <td>{item.quantidadePecas}× {item.medidaCorteCm} cm</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

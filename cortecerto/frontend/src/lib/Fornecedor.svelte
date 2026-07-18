<script>
  /**
   * Estoque & cortes — a área operacional que não é chão de fábrica nem CRM.
   *
   * Aqui o encarregado: acompanha o funil de pedidos (visão gerencial, não de
   * corte), controla o estoque de chapas e usa a calculadora/plano de corte
   * para orçar. A produção item a item foi para a tela do Produtor; o painel
   * financeiro, para a do Dono. Cada tela com um dono claro.
   */
  import { onMount } from "svelte";
  import { api, fraseDoCorte, progressoDoPedido, proximoStatus, real, statusInfo } from "./api.js";
  import CorteVisual from "./CorteVisual.svelte";

  let estoque = [];
  let pedidos = [];

  let calc = { tamanhoChapa: "275", tamanhoCorte: "35.7", kerf: "0" };
  let resultadoCalc = null;
  let msgCalc = "";

  let planoTexto = "";
  let plano = null;
  let msgPlano = "";

  onMount(carregarTudo);

  async function carregarTudo() {
    [estoque, pedidos] = await Promise.all([api("/estoque"), api("/pedidos")]);
  }

  // Funil: quantos pedidos em cada etapa (a saúde do negócio num relance).
  $: funil = ["recebido", "em_producao", "pronto", "entregue"].map((status) => ({
    status,
    info: statusInfo(status),
    total: pedidos.filter((p) => p.status === status).length,
  }));

  async function avancar(pedido) {
    const proximo = proximoStatus(pedido.status);
    if (!proximo) return;
    await api(`/pedidos/${pedido.id}/status`, { metodo: "PUT", corpo: { status: proximo } });
    carregarTudo();
  }

  async function calcular() {
    msgCalc = "";
    resultadoCalc = null;
    try {
      resultadoCalc = await api("/corte", {
        metodo: "POST",
        corpo: {
          tamanhoChapa: Number(calc.tamanhoChapa),
          tamanhoCorte: Number(calc.tamanhoCorte),
          kerf: Number(calc.kerf) || 0,
        },
      });
    } catch (falha) {
      msgCalc = falha.message;
    }
  }

  async function montarPlano() {
    msgPlano = "";
    plano = null;
    const cortes = planoTexto
      .split(/[,;\s]+/)
      .map((parte) => Number(parte.replace(",", ".")))
      .filter((numero) => numero > 0);
    if (cortes.length === 0) {
      msgPlano = "Digite os cortes separados por vírgula. Ex.: 60, 50, 30, 25";
      return;
    }
    try {
      plano = await api("/corte/plano", {
        metodo: "POST",
        corpo: { tamanhoChapa: Number(calc.tamanhoChapa), cortes, kerf: Number(calc.kerf) || 0 },
      });
    } catch (falha) {
      msgPlano = falha.message;
    }
  }

  async function salvarQuantidade(item) {
    await api("/estoque", {
      metodo: "POST",
      corpo: { chapaId: item.chapaId, quantidade: Number(item.quantidade) || 0 },
    });
    carregarTudo();
  }
</script>

<!-- ===== Funil de pedidos ===== -->
<section class="card">
  <h2>📋 Funil de pedidos</h2>
  <div class="funil">
    {#each funil as etapa}
      <div class="funil-etapa" style="border-color: {etapa.info.cor}">
        <strong style="color: {etapa.info.cor}">{etapa.total}</strong>
        <span>{etapa.info.rotulo}</span>
      </div>
    {/each}
  </div>

  <div class="tabela-wrap" style="margin-top:0.8rem">
    <table>
      <thead><tr><th>Código</th><th>Cliente</th><th>Itens</th><th>Produção</th><th>Status</th><th></th></tr></thead>
      <tbody>
        {#each pedidos as pedido (pedido.id)}
          <tr>
            <td><strong>{pedido.codigo}</strong></td>
            <td>{pedido.nomeCliente}</td>
            <td>{pedido.itens.length}</td>
            <td>
              <div class="progresso"><div style="width: {progressoDoPedido(pedido)}%"></div></div>
              <small class="dica">{progressoDoPedido(pedido)}%</small>
            </td>
            <td><span class="status-selo" style="background: {statusInfo(pedido.status).cor}">{statusInfo(pedido.status).rotulo}</span></td>
            <td>
              {#if proximoStatus(pedido.status)}
                <button class="mini suave" on:click={() => avancar(pedido)}>avançar ➡️</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<!-- ===== Calculadora ===== -->
<section class="card">
  <h2>✂️ Calculadora de corte</h2>
  <p class="dica">Para orçar: quantas peças saem de uma chapa e a sobra exata.</p>
  <div class="duas-colunas" style="margin-top: 0.5rem">
    <div>
      <label for="tam-chapa">Tamanho da chapa (cm)</label>
      <input id="tam-chapa" type="number" step="0.1" min="0.1" bind:value={calc.tamanhoChapa} />
      <label for="tam-corte">Tamanho de cada corte (cm)</label>
      <input id="tam-corte" type="number" step="0.1" min="0.1" bind:value={calc.tamanhoCorte} />
      <label for="kerf">Espessura da lâmina — kerf (cm)</label>
      <input id="kerf" type="number" step="0.05" min="0" bind:value={calc.kerf} />
      <button on:click={calcular}>Calcular</button>
      <p class="msg erro">{msgCalc}</p>
      {#if resultadoCalc}
        <div class="resultado">
          {fraseDoCorte(resultadoCalc, Number(calc.tamanhoChapa), Number(calc.tamanhoCorte))}
          <br /><small>Aproveitamento: {resultadoCalc.aproveitamento}%</small>
        </div>
        {#if resultadoCalc.pecas > 0}
          <CorteVisual
            tamanhoChapa={Number(calc.tamanhoChapa)}
            cortes={Array(resultadoCalc.pecas).fill(Number(calc.tamanhoCorte))}
            sobra={resultadoCalc.sobra}
            mostrarSobra={true}
          />
        {/if}
      {/if}
    </div>

    <div>
      <label for="plano">Plano de corte — vários cortes de uma vez</label>
      <input id="plano" placeholder="ex.: 60, 50, 30, 25" bind:value={planoTexto} />
      <button class="suave" on:click={montarPlano}>Montar plano otimizado</button>
      <p class="msg erro">{msgPlano}</p>
      {#if plano}
        <div class="resultado">
          🧮 <strong>{plano.chapas_necessarias} chapa(s)</strong> —
          aproveitamento de {plano.aproveitamento}% (sobra total: {plano.sobra_total} cm)
          <ul style="margin: 0.4rem 0 0 1.2rem">
            {#each plano.plano as etapa}
              <li>Chapa {etapa.chapa}: cortes de {etapa.cortes.join(" + ")} cm → sobra <strong>{etapa.sobra} cm</strong></li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- ===== Estoque ===== -->
<section class="card">
  <h2>📦 Estoque de chapas</h2>
  <p class="dica">Material, tamanho, cor e grossura — edite a quantidade e salve.</p>
  <div class="tabela-wrap">
    <table>
      <thead><tr><th>Chapa</th><th>Material</th><th>Tamanho</th><th>Cor</th><th>Grossura</th><th>Qtd</th><th></th></tr></thead>
      <tbody>
        {#each estoque as item (item.id)}
          <tr>
            <td>{item.chapa?.nome}</td>
            <td>{item.chapa?.material}</td>
            <td>{item.chapa?.tamanhoCm} cm</td>
            <td>
              <span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:{item.chapa?.corHex};border:1px solid rgba(0,0,0,0.15);vertical-align:-2px"></span>
              {item.chapa?.corNome}
            </td>
            <td>{item.chapa?.espessuraMm} mm</td>
            <td style="max-width: 90px"><input type="number" min="0" bind:value={item.quantidade} /></td>
            <td><button class="mini" on:click={() => salvarQuantidade(item)}>💾</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

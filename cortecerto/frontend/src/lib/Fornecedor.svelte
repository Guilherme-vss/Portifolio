<script>
  /**
   * Área do FORNECEDOR: fila de pedidos com checklist de produção
   * (marca item a item conforme corta), estoque e calculadora.
   */
  import { onMount } from "svelte";
  import { api, fraseDoCorte, progressoDoPedido, proximoStatus, real, statusInfo } from "./api.js";

  let estoque = [];
  let pedidos = [];
  let pedidoAberto = null; // id do pedido expandido

  // Calculadora rápida
  let calc = { tamanhoChapa: "90", tamanhoCorte: "35.7", kerf: "0" };
  let resultadoCalc = null;
  let msgCalc = "";

  // Plano de corte (vários cortes de uma vez)
  let planoTexto = "";
  let plano = null;
  let msgPlano = "";

  onMount(carregarTudo);

  async function carregarTudo() {
    try {
      [estoque, pedidos] = await Promise.all([api("/estoque"), api("/pedidos")]);
    } catch {
      /* mensagens específicas aparecem em cada ação */
    }
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

  async function marcarItem(pedido, item) {
    await api(`/pedidos/${pedido.id}/itens/${item.id}/feito`, {
      metodo: "PUT",
      corpo: { feito: !item.feito },
    });
    await carregarTudo();
    pedidoAberto = pedido.id; // mantém o pedido aberto após atualizar
  }

  async function avancarStatus(pedido) {
    const proximo = proximoStatus(pedido.status);
    if (!proximo) return;
    await api(`/pedidos/${pedido.id}/status`, { metodo: "PUT", corpo: { status: proximo } });
    await carregarTudo();
    pedidoAberto = pedido.id;
  }

  async function salvarQuantidade(item) {
    await api("/estoque", {
      metodo: "POST",
      corpo: { chapaId: item.chapaId, quantidade: Number(item.quantidade) || 0 },
    });
    carregarTudo();
  }
</script>

<!-- ===== Fila de pedidos ===== -->
<section class="card">
  <h2>📋 Fila de pedidos</h2>
  {#if pedidos.length === 0}
    <em class="dica">Nenhum pedido ainda — compartilhe a aba "Fazer pedido" com seus clientes!</em>
  {/if}

  {#each pedidos as pedido (pedido.id)}
    <div style="border:1px solid var(--borda);border-radius:12px;padding:0.9rem 1rem;margin-top:0.8rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;flex-wrap:wrap">
        <div>
          <strong>{pedido.nomeCliente}</strong>
          <span class="dica"> • {pedido.contato} • código {pedido.codigo}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
          <span class="status-selo" style="background: {statusInfo(pedido.status).cor}">
            {statusInfo(pedido.status).rotulo}
          </span>
          {#if proximoStatus(pedido.status)}
            <button class="mini suave" on:click={() => avancarStatus(pedido)}>avançar ➡️</button>
          {/if}
          <button class="mini" on:click={() => (pedidoAberto = pedidoAberto === pedido.id ? null : pedido.id)}>
            {pedidoAberto === pedido.id ? "▲ fechar" : `▼ ver ${pedido.itens.length} itens`}
          </button>
        </div>
      </div>

      <div class="progresso"><div style="width: {progressoDoPedido(pedido)}%"></div></div>
      <small class="dica">{progressoDoPedido(pedido)}% produzido
        ({pedido.itens.filter((item) => item.feito).length} de {pedido.itens.length} itens)</small>

      {#if pedidoAberto === pedido.id}
        {#if pedido.observacao}
          <p class="dica" style="margin-top:0.4rem">📝 {pedido.observacao}</p>
        {/if}
        <div class="tabela-wrap">
          <table>
            <thead>
              <tr><th>Feito</th><th>Chapa</th><th>Material</th><th>Corte</th><th>Qtd</th><th>Produção</th></tr>
            </thead>
            <tbody>
              {#each pedido.itens as item (item.id)}
                <tr style={item.feito ? "opacity:0.55" : ""}>
                  <td>
                    <input type="checkbox" checked={item.feito}
                           on:change={() => marcarItem(pedido, item)}
                           style="width:19px;height:19px;accent-color:#ea580c" />
                  </td>
                  <td>
                    <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:{item.chapa?.corHex};border:1px solid rgba(0,0,0,0.15);vertical-align:-1px"></span>
                    {item.chapa?.nome}
                  </td>
                  <td>{item.chapa?.material}</td>
                  <td>{item.quantidadePecas}× {item.medidaCorteCm} cm</td>
                  <td>{real(item.chapa?.precoPorChapa)} / chapa</td>
                  <td>
                    <small class="dica">
                      {Math.floor(item.chapa?.tamanhoCm / item.medidaCorteCm) || 0} peças/chapa
                    </small>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/each}
</section>

<!-- ===== Calculadora de corte ===== -->
<section class="card">
  <h2>✂️ Calculadora de corte</h2>
  <p class="dica">
    O clássico do balcão: chapa de 90 cortada em 35,7 → o sistema responde
    na hora quantas peças saem e a sobra exata.
  </p>
  <div class="duas-colunas" style="margin-top: 0.5rem">
    <div>
      <label for="tam-chapa">Tamanho da chapa (cm)</label>
      <input id="tam-chapa" type="number" step="0.1" min="0.1" bind:value={calc.tamanhoChapa} />
      <label for="tam-corte">Tamanho de cada corte (cm)</label>
      <input id="tam-corte" type="number" step="0.1" min="0.1" bind:value={calc.tamanhoCorte} />
      <label for="kerf">Espessura da lâmina — kerf (cm, opcional)</label>
      <input id="kerf" type="number" step="0.05" min="0" bind:value={calc.kerf} />
      <button on:click={calcular}>Calcular</button>
      <p class="msg erro">{msgCalc}</p>

      {#if resultadoCalc}
        <div class="resultado">
          {fraseDoCorte(resultadoCalc, Number(calc.tamanhoChapa), Number(calc.tamanhoCorte))}
          <br /><small>Aproveitamento: {resultadoCalc.aproveitamento}%</small>
        </div>
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
          aproveitamento de {plano.aproveitamento}%
          (sobra total: {plano.sobra_total} cm)
          <ul style="margin: 0.4rem 0 0 1.2rem">
            {#each plano.plano as etapa}
              <li>
                Chapa {etapa.chapa}: cortes de {etapa.cortes.join(" + ")} cm
                → sobra <strong>{etapa.sobra} cm</strong>
              </li>
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
  <p class="dica">Material, tamanho, cor e grossura de cada chapa — edite a quantidade e salve.</p>
  <div class="tabela-wrap">
    <table>
      <thead>
        <tr><th>Chapa</th><th>Material</th><th>Tamanho</th><th>Cor</th><th>Grossura</th><th>Quantidade</th><th></th></tr>
      </thead>
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
            <td style="max-width: 90px">
              <input type="number" min="0" bind:value={item.quantidade} />
            </td>
            <td><button class="mini" on:click={() => salvarQuantidade(item)}>💾 salvar</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

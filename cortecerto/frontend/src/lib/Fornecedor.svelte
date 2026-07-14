<script>
  /**
   * Área do FORNECEDOR: estoque, calculadora de corte e fila de pedidos.
   * É o chão de fábrica do CorteCerto.
   */
  import { onMount } from "svelte";
  import { api, fraseDoCorte, proximoStatus, statusInfo } from "./api.js";

  let estoque = [];
  let pedidos = [];
  let chapas = [];

  // Calculadora rápida
  let calc = { tamanhoChapa: "90", tamanhoCorte: "35.7", kerf: "0" };
  let resultadoCalc = null;
  let msgCalc = "";

  // Plano de corte (vários cortes de uma vez)
  let planoTexto = "";
  let plano = null;
  let msgPlano = "";

  // Produção por pedido: id → resultado de chapas-necessárias
  let producao = {};

  onMount(carregarTudo);

  async function carregarTudo() {
    try {
      [estoque, pedidos, chapas] = await Promise.all([
        api("/estoque"),
        api("/pedidos"),
        api("/chapas"),
      ]);
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
        corpo: {
          tamanhoChapa: Number(calc.tamanhoChapa),
          cortes,
          kerf: Number(calc.kerf) || 0,
        },
      });
    } catch (falha) {
      msgPlano = falha.message;
    }
  }

  async function calcularProducao(pedido) {
    try {
      const resultado = await api("/corte/chapas-necessarias", {
        metodo: "POST",
        corpo: {
          tamanhoChapa: pedido.chapa.tamanhoCm,
          tamanhoCorte: pedido.medidaCorteCm,
          pecasNecessarias: pedido.quantidadePecas,
        },
      });
      producao = { ...producao, [pedido.id]: resultado };
    } catch (falha) {
      producao = { ...producao, [pedido.id]: { erro: falha.message } };
    }
  }

  async function avancarStatus(pedido) {
    const proximo = proximoStatus(pedido.status);
    if (!proximo) return;
    await api(`/pedidos/${pedido.id}/status`, { metodo: "PUT", corpo: { status: proximo } });
    carregarTudo();
  }

  async function salvarQuantidade(item) {
    await api("/estoque", {
      metodo: "POST",
      corpo: { chapaId: item.chapaId, quantidade: Number(item.quantidade) || 0 },
    });
    carregarTudo();
  }
</script>

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

<!-- ===== Pedidos ===== -->
<section class="card">
  <h2>📋 Pedidos recebidos</h2>
  {#if pedidos.length === 0}
    <em class="dica">Nenhum pedido ainda — compartilhe a aba "Fazer pedido" com seus clientes!</em>
  {:else}
    <div class="tabela-wrap">
      <table>
        <thead>
          <tr>
            <th>Cliente</th><th>Chapa</th><th>Corte</th><th>Status</th><th>Produção</th>
          </tr>
        </thead>
        <tbody>
          {#each pedidos as pedido}
            <tr>
              <td>
                <strong>{pedido.nomeCliente}</strong><br />
                <small class="dica">{pedido.contato}</small>
              </td>
              <td>
                {pedido.chapa?.nome}<br />
                <small class="dica">
                  {pedido.chapa?.tamanhoCm} cm • {pedido.chapa?.corNome} • {pedido.chapa?.espessuraMm} mm
                </small>
              </td>
              <td>{pedido.quantidadePecas}× {pedido.medidaCorteCm} cm</td>
              <td>
                <span class="status-selo" style="background: {statusInfo(pedido.status).cor}">
                  {statusInfo(pedido.status).rotulo}
                </span>
                {#if proximoStatus(pedido.status)}
                  <br />
                  <button class="mini suave" style="margin-top: 0.3rem" on:click={() => avancarStatus(pedido)}>
                    avançar ➡️
                  </button>
                {/if}
              </td>
              <td>
                <button class="mini" on:click={() => calcularProducao(pedido)}>🧮 calcular</button>
                {#if producao[pedido.id]}
                  {#if producao[pedido.id].erro}
                    <small class="msg erro">{producao[pedido.id].erro}</small>
                  {:else if producao[pedido.id].possivel === false}
                    <small class="msg erro">{producao[pedido.id].motivo}</small>
                  {:else}
                    <small class="dica">
                      {producao[pedido.id].chapas} chapa(s) •
                      {producao[pedido.id].pecas_por_chapa} peças/chapa •
                      sobra final {producao[pedido.id].sobra_ultima_chapa} cm
                    </small>
                  {/if}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<!-- ===== Estoque ===== -->
<section class="card">
  <h2>📦 Estoque de chapas</h2>
  <p class="dica">Tamanho do corte, cor e grossura de cada chapa — edite a quantidade e salve.</p>
  <div class="tabela-wrap">
    <table>
      <thead>
        <tr><th>Chapa</th><th>Tamanho</th><th>Cor</th><th>Grossura</th><th>Quantidade</th><th></th></tr>
      </thead>
      <tbody>
        {#each estoque as item}
          <tr>
            <td>{item.chapa?.nome}</td>
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

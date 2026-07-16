<script>
  /**
   * Área do CLIENTE: monta uma LISTA de chapas (alumínio, MDF ou HDF),
   * cada uma com sua medida e quantidade, e envia tudo num pedido só.
   * Ao final recebe um código para acompanhar o andamento.
   */
  import { onMount } from "svelte";
  import { api, real, validarItem, validarPedido } from "./api.js";
  import CorteVisual from "./CorteVisual.svelte";

  let chapas = [];
  let materiais = [];
  let filtroMaterial = "todos";
  let chapaEscolhida = null;

  let itemAtual = { medidaCorteCm: "", quantidadePecas: "" };
  let carrinho = [];

  let cliente = { nomeCliente: "", contato: "", observacao: "" };
  let msgItem = "";
  let msg = "";
  let erro = false;
  let enviando = false;
  let simulacao = null;
  let codigoGerado = "";

  onMount(async () => {
    try {
      chapas = await api("/chapas");
      materiais = [...new Set(chapas.map((chapa) => chapa.material))];
    } catch (falha) {
      erro = true;
      msg = falha.message;
    }
  });

  $: chapasVisiveis =
    filtroMaterial === "todos" ? chapas : chapas.filter((chapa) => chapa.material === filtroMaterial);

  $: totalEstimado = carrinho.reduce((soma, item) => {
    const porChapa = Math.max(1, Math.floor(item.chapa.tamanhoCm / item.medidaCorteCm));
    const chapasNecessarias = Math.ceil(item.quantidadePecas / porChapa);
    return soma + chapasNecessarias * item.chapa.precoPorChapa;
  }, 0);

  // Simulação ao vivo: quantas peças saem por chapa e a sobra
  async function simular() {
    simulacao = null;
    const medida = Number(itemAtual.medidaCorteCm);
    if (!chapaEscolhida || !medida || medida <= 0) return;
    try {
      simulacao = await api("/corte", {
        metodo: "POST",
        corpo: { tamanhoChapa: chapaEscolhida.tamanhoCm, tamanhoCorte: medida },
      });
    } catch {
      simulacao = null;
    }
  }

  function adicionarAoCarrinho() {
    msgItem = "";
    const problema = validarItem(
      { chapaId: chapaEscolhida?.id, ...itemAtual },
      chapaEscolhida?.tamanhoCm
    );
    if (problema) {
      msgItem = problema;
      return;
    }
    carrinho = [
      ...carrinho,
      {
        chapa: chapaEscolhida,
        medidaCorteCm: Number(itemAtual.medidaCorteCm),
        quantidadePecas: Number(itemAtual.quantidadePecas),
      },
    ];
    itemAtual = { medidaCorteCm: "", quantidadePecas: "" };
    simulacao = null;
    msgItem = "Chapa adicionada à lista ✅ — pode adicionar outra!";
  }

  function removerDoCarrinho(indice) {
    carrinho = carrinho.filter((_, i) => i !== indice);
  }

  async function enviarPedido() {
    erro = false;
    msg = "";
    codigoGerado = "";
    const problema = validarPedido({ ...cliente, itens: carrinho });
    if (problema) {
      erro = true;
      msg = problema;
      return;
    }

    enviando = true;
    try {
      const resposta = await api("/pedidos", {
        metodo: "POST",
        corpo: {
          ...cliente,
          itens: carrinho.map((item) => ({
            chapaId: item.chapa.id,
            medidaCorteCm: item.medidaCorteCm,
            quantidadePecas: item.quantidadePecas,
          })),
        },
      });
      msg = resposta.mensagem;
      codigoGerado = resposta.codigo;
      carrinho = [];
      cliente = { nomeCliente: "", contato: "", observacao: "" };
      chapaEscolhida = null;
    } catch (falha) {
      erro = true;
      msg = falha.message;
    } finally {
      enviando = false;
    }
  }
</script>

<section class="card">
  <h2>1️⃣ Escolha o material e a chapa</h2>
  <p class="dica">Alumínio para esquadrias, MDF e HDF para marcenaria — cada cartão mostra tamanho, cor e grossura.</p>

  <div class="filtros">
    <button class="mini" class:suave={filtroMaterial !== "todos"} on:click={() => (filtroMaterial = "todos")}>Todos</button>
    {#each materiais as material}
      <button class="mini" class:suave={filtroMaterial !== material} on:click={() => (filtroMaterial = material)}>
        {material}
      </button>
    {/each}
  </div>

  <div class="chapas" style="margin-top: 0.8rem">
    {#each chapasVisiveis as chapa}
      <div
        class="chapa"
        class:escolhida={chapaEscolhida?.id === chapa.id}
        role="button"
        tabindex="0"
        on:click={() => { chapaEscolhida = chapa; simular(); }}
        on:keydown={(e) => e.key === "Enter" && (chapaEscolhida = chapa)}
      >
        <div class="chapa__cor" style="background: {chapa.corHex}"></div>
        <strong>{chapa.nome}</strong>
        <small>🧱 {chapa.material} • 📏 {chapa.tamanhoCm} cm • 🎨 {chapa.corNome} • 🔩 {chapa.espessuraMm} mm</small>
        <span class="preco">{real(chapa.precoPorChapa)} / chapa</span>
      </div>
    {/each}
  </div>
</section>

<section class="card">
  <h2>2️⃣ Monte sua lista de cortes</h2>
  <div class="duas-colunas">
    <div>
      <label for="medida">Medida de cada peça (cm)</label>
      <input id="medida" type="number" step="0.1" min="0.1" placeholder="ex.: 35,7"
             bind:value={itemAtual.medidaCorteCm} on:input={simular} />

      <label for="qtd">Quantidade de peças</label>
      <input id="qtd" type="number" min="1" placeholder="ex.: 4" bind:value={itemAtual.quantidadePecas} />

      <button class="suave" on:click={adicionarAoCarrinho}>➕ Adicionar chapa à lista</button>
      <p class="msg" class:erro={msgItem.includes("maior") || msgItem.includes("Escolha") || msgItem.includes("Informe") || msgItem.includes("Peça")}>{msgItem}</p>
    </div>
    <div>
      {#if simulacao && chapaEscolhida}
        <div class="resultado">
          ✂️ Da chapa de <strong>{chapaEscolhida.tamanhoCm} cm</strong> saem
          <strong>{simulacao.pecas} peça(s)</strong> da sua medida,
          com sobra de <strong>{simulacao.sobra} cm</strong>
          (aproveitamento de {simulacao.aproveitamento}%).
        </div>
        {#if simulacao.pecas > 0}
          <CorteVisual
            tamanhoChapa={chapaEscolhida.tamanhoCm}
            cortes={Array(simulacao.pecas).fill(Number(itemAtual.medidaCorteCm))}
            sobra={simulacao.sobra}
            cor={chapaEscolhida.corHex}
          />
        {/if}
      {:else}
        <p class="dica" style="margin-top:1.6rem">
          👆 Escolha uma chapa e digite a medida: a simulação de corte aparece aqui
          em tempo real, antes mesmo de você pedir.
        </p>
      {/if}
    </div>
  </div>

  {#if carrinho.length > 0}
    <div class="tabela-wrap">
      <table>
        <thead>
          <tr><th>Chapa</th><th>Material</th><th>Corte</th><th>Qtd</th><th></th></tr>
        </thead>
        <tbody>
          {#each carrinho as item, indice}
            <tr>
              <td>
                <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:{item.chapa.corHex};border:1px solid rgba(0,0,0,0.15);vertical-align:-1px"></span>
                {item.chapa.nome}
              </td>
              <td>{item.chapa.material}</td>
              <td>{item.medidaCorteCm} cm</td>
              <td>{item.quantidadePecas}×</td>
              <td><button class="mini suave" on:click={() => removerDoCarrinho(indice)}>🗑 remover</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="dica" style="margin-top:0.5rem">
      💰 Estimativa de material: <strong>{real(totalEstimado)}</strong>
      (o valor final é confirmado pela esquadria)
    </p>
  {/if}
</section>

<section class="card">
  <h2>3️⃣ Seus dados e envio</h2>
  <div class="duas-colunas">
    <div>
      <label for="nome">Seu nome</label>
      <input id="nome" placeholder="Maria da Silva" bind:value={cliente.nomeCliente} />
      <label for="contato">Telefone ou email</label>
      <input id="contato" placeholder="(11) 90000-0000" bind:value={cliente.contato} />
    </div>
    <div>
      <label for="obs">Observações (opcional)</label>
      <textarea id="obs" rows="4" placeholder="detalhes do projeto, prazo..." bind:value={cliente.observacao}></textarea>
    </div>
  </div>

  <button on:click={enviarPedido} disabled={enviando || carrinho.length === 0}>
    {enviando ? "Enviando..." : `📨 Enviar pedido (${carrinho.length} ${carrinho.length === 1 ? "chapa" : "chapas"})`}
  </button>
  <p class="msg" class:erro>{msg}</p>

  {#if codigoGerado}
    <div class="resultado" style="text-align:center">
      🎫 Seu código de acompanhamento: <strong style="font-size:1.3rem">{codigoGerado}</strong>
      <br /><small>Use a aba "📦 Acompanhar" para ver o andamento da produção.</small>
    </div>
  {/if}
</section>

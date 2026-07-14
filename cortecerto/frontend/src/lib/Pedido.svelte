<script>
  /**
   * Área do CLIENTE: vê o catálogo de chapas (tamanho, cor, grossura)
   * e faz o pedido com a medida do corte e a quantidade de peças.
   */
  import { onMount } from "svelte";
  import { api, real, validarPedido } from "./api.js";

  let chapas = [];
  let chapaEscolhida = null;
  let form = { nomeCliente: "", contato: "", medidaCorteCm: "", quantidadePecas: "", observacao: "" };
  let msg = "";
  let erro = false;
  let enviando = false;
  let simulacao = null;

  onMount(async () => {
    try {
      chapas = await api("/chapas");
    } catch (falha) {
      erro = true;
      msg = falha.message;
    }
  });

  // Simulação ao vivo: assim que o cliente digita a medida, mostramos
  // quantas peças saem por chapa e a sobra — transparência total.
  async function simular() {
    simulacao = null;
    const medida = Number(form.medidaCorteCm);
    if (!chapaEscolhida || !medida || medida <= 0) return;
    try {
      simulacao = await api("/corte", {
        metodo: "POST",
        corpo: { tamanhoChapa: chapaEscolhida.tamanhoCm, tamanhoCorte: medida },
      });
    } catch {
      simulacao = null; // simulação é cortesia; o pedido não depende dela
    }
  }

  async function enviarPedido() {
    erro = false;
    msg = "";
    const problema = validarPedido({ ...form, chapaId: chapaEscolhida?.id });
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
          nomeCliente: form.nomeCliente,
          contato: form.contato,
          chapaId: chapaEscolhida.id,
          medidaCorteCm: Number(form.medidaCorteCm),
          quantidadePecas: Number(form.quantidadePecas),
          observacao: form.observacao,
        },
      });
      msg = resposta.mensagem;
      form = { nomeCliente: "", contato: "", medidaCorteCm: "", quantidadePecas: "", observacao: "" };
      chapaEscolhida = null;
      simulacao = null;
    } catch (falha) {
      erro = true;
      msg = falha.message;
    } finally {
      enviando = false;
    }
  }
</script>

<section class="card">
  <h2>1️⃣ Escolha a chapa</h2>
  <p class="dica">Cada cartão mostra o tamanho da chapa, a cor e a grossura (espessura).</p>
  <div class="chapas" style="margin-top: 0.8rem">
    {#each chapas as chapa}
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
        <small>📏 {chapa.tamanhoCm} cm • 🎨 {chapa.corNome} • 🔩 {chapa.espessuraMm} mm</small>
        <span class="preco">{real(chapa.precoPorChapa)} / chapa</span>
      </div>
    {/each}
  </div>
</section>

<section class="card">
  <h2>2️⃣ Medidas e contato</h2>
  <div class="duas-colunas">
    <div>
      <label for="medida">Medida de cada peça (cm)</label>
      <input id="medida" type="number" step="0.1" min="0.1" placeholder="ex.: 35,7"
             bind:value={form.medidaCorteCm} on:input={simular} />

      <label for="qtd">Quantidade de peças</label>
      <input id="qtd" type="number" min="1" placeholder="ex.: 4" bind:value={form.quantidadePecas} />

      <label for="obs">Observações (opcional)</label>
      <textarea id="obs" rows="2" placeholder="detalhes do projeto, prazo..." bind:value={form.observacao}></textarea>
    </div>
    <div>
      <label for="nome">Seu nome</label>
      <input id="nome" placeholder="Maria da Silva" bind:value={form.nomeCliente} />

      <label for="contato">Telefone ou email</label>
      <input id="contato" placeholder="(11) 90000-0000" bind:value={form.contato} />

      {#if simulacao && chapaEscolhida}
        <div class="resultado">
          ✂️ Da chapa de <strong>{chapaEscolhida.tamanhoCm} cm</strong> saem
          <strong>{simulacao.pecas} peça(s)</strong> da sua medida,
          com sobra de <strong>{simulacao.sobra} cm</strong>
          (aproveitamento de {simulacao.aproveitamento}%).
        </div>
      {/if}
    </div>
  </div>

  <button on:click={enviarPedido} disabled={enviando}>
    {enviando ? "Enviando..." : "📨 Enviar pedido"}
  </button>
  <p class="msg" class:erro>{msg}</p>
</section>

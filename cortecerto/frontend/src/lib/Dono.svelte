<script>
  /**
   * Dono.svelte — o CRM de quem é dono da marcenaria.
   *
   * Aqui está o que o dono acorda pensando: quanto entrou, quanto sobrou de
   * lucro, o que ainda vai receber, quem está produzindo. Não é relatório
   * de contador — é o painel de decisão de quem paga a folha no fim do mês.
   */
  import { onMount } from "svelte";
  import { api, real } from "./api.js";

  let painel = null;
  let funcionarios = [];
  let novo = { nome: "", funcao: "", admissao: "" };
  let msg = "";

  async function carregar() {
    [painel, funcionarios] = await Promise.all([api("/crm/painel"), api("/funcionarios")]);
  }
  onMount(carregar);

  async function admitir() {
    if (!novo.nome.trim() || !novo.funcao.trim()) {
      msg = "Informe nome e função do funcionário.";
      return;
    }
    await api("/funcionarios", { metodo: "POST", corpo: { ...novo, admissao: novo.admissao || new Date().toISOString().slice(0, 10) } });
    novo = { nome: "", funcao: "", admissao: "" };
    msg = "Funcionário cadastrado ✅";
    carregar();
  }

  async function demitir(f) {
    if (!confirm(`Desligar ${f.nome} da equipe?`)) return;
    await api(`/funcionarios/${f.id}`, { metodo: "DELETE" });
    carregar();
  }

  const maiorMaterial = (lista) => Math.max(1, ...lista.map((m) => m.valor));
</script>

{#if painel}
  <!-- Cartões de topo: os números que importam -->
  <section class="kpis">
    <div class="kpi kpi--verde">
      <span class="kpi__rotulo">💰 Faturamento</span>
      <strong>{real(painel.financeiro.faturamento)}</strong>
      <small>{painel.financeiro.pedidosEntregues} pedido(s) entregues</small>
    </div>
    <div class="kpi kpi--azul">
      <span class="kpi__rotulo">📈 Lucro</span>
      <strong>{real(painel.financeiro.lucro)}</strong>
      <small>margem real de {painel.financeiro.margemReal}%</small>
    </div>
    <div class="kpi kpi--ambar">
      <span class="kpi__rotulo">⏳ A receber</span>
      <strong>{real(painel.financeiro.aReceber)}</strong>
      <small>{painel.financeiro.pedidosEmAndamento} em produção</small>
    </div>
    <div class="kpi kpi--cinza">
      <span class="kpi__rotulo">🎫 Ticket médio</span>
      <strong>{real(painel.financeiro.ticketMedio)}</strong>
      <small>{painel.funcionariosAtivos} funcionário(s)</small>
    </div>
  </section>

  <!-- Faturamento por material -->
  <section class="card">
    <h2>📊 De onde vem o dinheiro</h2>
    <p class="dica">Faturamento por tipo de chapa (só pedidos entregues).</p>
    {#if painel.porMaterial.length === 0}
      <em class="dica">Nenhum pedido entregue ainda.</em>
    {/if}
    {#each painel.porMaterial as m}
      <div class="barra-linha">
        <span>{m.material}</span>
        <div class="barra-crm"><div style="width: {(m.valor / maiorMaterial(painel.porMaterial)) * 100}%"></div></div>
        <strong>{real(m.valor)}</strong>
      </div>
    {/each}
  </section>

  <!-- Produtividade -->
  <section class="card">
    <h2>🏭 Produtividade da equipe</h2>
    <p class="dica">Quantas peças cada um cortou — reconhecer quem produz é reter quem produz.</p>
    <div class="tabela-wrap">
      <table>
        <thead><tr><th>Funcionário</th><th>Função</th><th>Peças cortadas</th><th>Itens</th></tr></thead>
        <tbody>
          {#each painel.produtividade as p, i}
            <tr>
              <td>{i === 0 ? "🥇 " : ""}{p.nome}</td>
              <td>{p.funcao}</td>
              <td><strong>{p.pecasCortadas}</strong></td>
              <td>{p.itensFeitos}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <!-- Funcionários -->
  <section class="card">
    <h2>👷 Funcionários</h2>
    <div class="tabela-wrap">
      <table>
        <thead><tr><th>Nome</th><th>Função</th><th>Desde</th><th></th></tr></thead>
        <tbody>
          {#each funcionarios.filter((f) => f.ativo) as f}
            <tr>
              <td>{f.nome}</td>
              <td>{f.funcao}</td>
              <td>{new Date(f.admissao).toLocaleDateString("pt-BR")}</td>
              <td><button class="mini suave" on:click={() => demitir(f)}>Desligar</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <h3 style="margin-top:1rem">➕ Contratar</h3>
    <div class="duas-colunas">
      <input placeholder="Nome" bind:value={novo.nome} />
      <input placeholder="Função (ex.: operador de serra)" bind:value={novo.funcao} />
    </div>
    <input type="date" bind:value={novo.admissao} style="max-width:200px" />
    <button on:click={admitir}>Cadastrar funcionário</button>
    <p class="msg">{msg}</p>
  </section>
{:else}
  <section class="card"><em>Carregando o painel...</em></section>
{/if}

<script setup>
/**
 * 🤖 Robô de dicas: cotações AO VIVO (dólar, euro, bitcoin via AwesomeAPI)
 * + análise dos seus gastos. Com IA configurada no servidor, o Claude
 * escreve as dicas; sem IA, as regras de mercado assumem — sempre com
 * dados reais do dia, nunca conselho de biscoito da sorte.
 */
import { onMounted, ref } from "vue";
import { api, real } from "../api.js";

const renda = ref("");
const dicas = ref([]);
const cotacoes = ref([]);
const fonte = ref("");
const pensando = ref(false);

async function pedirDicas() {
  pensando.value = true;
  try {
    const r = await api(`/dicas?renda=${parseFloat(renda.value) || 0}`);
    dicas.value = r.dicas;
    cotacoes.value = r.cotacoes || [];
    fonte.value =
      r.fonte === "ia"
        ? "✨ Dicas escritas por IA (Claude) com dados de mercado ao vivo"
        : "🤖 Robô de mercado: cotações ao vivo da AwesomeAPI + análise dos seus gastos";
  } finally {
    pensando.value = false;
  }
}

onMounted(pedirDicas);
</script>

<template>
  <section class="card">
    <h2>🤖 Robô de dicas do mês</h2>

    <div class="cotacoes" v-if="cotacoes.length > 0">
      <div class="cotacao" v-for="cotacao in cotacoes" :key="cotacao.codigo">
        <span class="cotacao__nome">{{ cotacao.nome }}</span>
        <strong>{{ real(cotacao.valor) }}</strong>
        <span class="cotacao__variacao" :class="cotacao.variacao_pct >= 0 ? 'alta' : 'baixa'">
          {{ cotacao.variacao_pct >= 0 ? "▲" : "▼" }} {{ Math.abs(cotacao.variacao_pct) }}%
        </span>
      </div>
    </div>

    <label>Sua renda mensal (R$) — usada só para calibrar as dicas</label>
    <input v-model="renda" type="number" step="0.01" min="0" style="max-width: 230px" />
    <button :disabled="pensando" @click="pedirDicas">
      {{ pensando ? "Consultando o mercado..." : "🔄 Atualizar dicas" }}
    </button>

    <p class="aviso" v-for="(dica, i) in dicas" :key="i">{{ dica }}</p>
    <p class="fonte-dica" v-if="fonte">{{ fonte }}</p>
  </section>
</template>

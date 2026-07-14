<script setup>
/** Dicas do mês — geradas por IA (Claude) ou por regras locais. */
import { ref } from "vue";
import { api } from "../api.js";

const renda = ref("");
const dicas = ref([]);
const fonte = ref("");
const pensando = ref(false);

async function pedirDicas() {
  pensando.value = true;
  try {
    const r = await api(`/dicas?renda=${parseFloat(renda.value) || 0}`);
    dicas.value = r.dicas;
    fonte.value = r.fonte === "ia" ? "✨ Dicas geradas por IA (Claude)" : "Dicas geradas por regras locais";
  } finally {
    pensando.value = false;
  }
}
</script>

<template>
  <section class="card">
    <h2>🧠 Dicas do mês</h2>
    <label>Sua renda mensal (R$) — usada só para calcular as dicas</label>
    <input v-model="renda" type="number" step="0.01" min="0" style="max-width: 230px" />
    <button :disabled="pensando" @click="pedirDicas">
      {{ pensando ? "Pensando..." : "Gerar dicas" }}
    </button>

    <p class="aviso" v-for="(dica, i) in dicas" :key="i">{{ dica }}</p>
    <p class="fonte-dica" v-if="fonte">{{ fonte }}</p>
  </section>
</template>

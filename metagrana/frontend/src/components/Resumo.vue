<script setup>
/** Resumo do mês: total gasto + quebra por categoria. */
import { ref, watch, onMounted } from "vue";
import { api, real } from "../api.js";

const props = defineProps({ versao: Number });

const resumo = ref({ total: 0, por_categoria: {} });

async function carregar() {
  resumo.value = await api("/gastos/resumo");
}

onMounted(carregar);
watch(() => props.versao, carregar);
</script>

<template>
  <section class="card">
    <h2>📊 Resumo do mês</h2>
    <div class="total-mes">{{ real(resumo.total) }}</div>
    <div class="categorias">
      <div class="linha" v-for="(valor, categoria) in resumo.por_categoria" :key="categoria">
        <span>{{ categoria }}</span>
        <strong>{{ real(valor) }}</strong>
      </div>
      <em v-if="Object.keys(resumo.por_categoria).length === 0" class="subtitulo">
        Nenhum gasto registrado neste mês ainda.
      </em>
    </div>
  </section>
</template>

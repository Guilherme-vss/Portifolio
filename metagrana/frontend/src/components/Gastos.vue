<script setup>
/** Registro e listagem dos gastos do mês. */
import { ref, watch, onMounted } from "vue";
import { api, mesAtual, real } from "../api.js";

const props = defineProps({ versao: Number });
const emit = defineEmits(["mudou"]);

const gastos = ref([]);
const form = ref({ descricao: "", categoria: "", valor: "" });
const msg = ref("");
const salvando = ref(false);

async function carregar() {
  gastos.value = await api(`/gastos?mes=${mesAtual()}`);
}

onMounted(carregar);
watch(() => props.versao, carregar);

async function registrar() {
  msg.value = "";
  salvando.value = true;
  try {
    await api("/gastos", {
      metodo: "POST",
      corpo: {
        descricao: form.value.descricao,
        categoria: form.value.categoria || "outros",
        valor: parseFloat(form.value.valor),
      },
    });
    form.value = { descricao: "", categoria: "", valor: "" };
    msg.value = "Gasto registrado ✅";
    emit("mudou");
  } catch (erro) {
    msg.value = erro.message;
  } finally {
    salvando.value = false;
  }
}

async function apagar(id) {
  await api(`/gastos/${id}`, { metodo: "DELETE" });
  emit("mudou");
}
</script>

<template>
  <section class="card">
    <h2>➖ Registrar gasto</h2>
    <form @submit.prevent="registrar">
      <label>Descrição</label>
      <input v-model="form.descricao" placeholder="ex.: mercado da semana" required />
      <label>Categoria</label>
      <input v-model="form.categoria" placeholder="mercado, lazer, contas..." />
      <label>Valor (R$)</label>
      <input v-model="form.valor" type="number" step="0.01" min="0.01" required />
      <button :disabled="salvando">{{ salvando ? "Salvando..." : "Adicionar" }}</button>
      <p class="msg">{{ msg }}</p>
    </form>

    <div class="linha" v-for="gasto in gastos.slice(0, 8)" :key="gasto.id">
      <span>{{ gasto.descricao }} <small>({{ gasto.categoria }})</small></span>
      <strong>{{ real(gasto.valor) }}</strong>
      <button class="mini perigo" @click="apagar(gasto.id)">🗑</button>
    </div>
  </section>
</template>

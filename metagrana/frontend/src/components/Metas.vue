<script setup>
/**
 * Metas de compra: criar, guardar dinheiro na caixinha,
 * buscar os menores preços no Mercado Livre e acompanhar o progresso.
 */
import { ref, watch, onMounted } from "vue";
import { api, fraseVariacao, real, validarMeta } from "../api.js";

const props = defineProps({ versao: Number });
const emit = defineEmits(["mudou"]);

const metas = ref([]);
const form = ref({ titulo: "", marca: "", modelo: "", valor_alvo: "" });
const msg = ref("");
const ofertas = ref({});     // por meta: { lista, frase }
const buscando = ref({});    // por meta: true enquanto consulta

async function carregar() {
  metas.value = await api("/metas");
}

onMounted(carregar);
watch(() => props.versao, carregar);

async function criar() {
  msg.value = "";
  const erro = validarMeta(form.value);
  if (erro) { msg.value = erro; return; }
  try {
    await api("/metas", {
      metodo: "POST",
      corpo: { ...form.value, valor_alvo: parseFloat(form.value.valor_alvo) },
    });
    form.value = { titulo: "", marca: "", modelo: "", valor_alvo: "" };
    msg.value = "Meta criada! O sistema já vai caçar preços. 🎯";
    emit("mudou");
  } catch (erro) {
    msg.value = erro.message;
  }
}

async function guardar(meta) {
  const valor = parseFloat(window.prompt(`Quanto guardar na meta "${meta.titulo}"? (R$)`));
  if (!valor || valor <= 0) return;
  await api(`/metas/${meta.id}/guardar`, { metodo: "POST", corpo: { valor } });
  emit("mudou");
}

async function buscarPrecos(meta) {
  buscando.value = { ...buscando.value, [meta.id]: true };
  try {
    const r = await api(`/metas/${meta.id}/precos`);
    ofertas.value = {
      ...ofertas.value,
      [meta.id]: { lista: r.ofertas, frase: fraseVariacao(r.variacao) },
    };
  } catch (erro) {
    ofertas.value = { ...ofertas.value, [meta.id]: { lista: [], frase: erro.message } };
  } finally {
    buscando.value = { ...buscando.value, [meta.id]: false };
  }
}

async function apagar(meta) {
  if (!window.confirm(`Apagar a meta "${meta.titulo}"?`)) return;
  await api(`/metas/${meta.id}`, { metodo: "DELETE" });
  emit("mudou");
}
</script>

<template>
  <section class="card">
    <h2>🎯 Metas de compra</h2>
    <form @submit.prevent="criar">
      <label>O que você quer?</label>
      <input v-model="form.titulo" placeholder="ex.: PlayStation 5" />
      <label>Marca / Modelo</label>
      <input v-model="form.marca" placeholder="ex.: Sony" />
      <input v-model="form.modelo" placeholder="ex.: Slim 1TB" style="margin-top: 0.4rem" />
      <label>Valor alvo (R$)</label>
      <input v-model="form.valor_alvo" type="number" step="0.01" min="0.01" />
      <button>Criar meta</button>
      <p class="msg">{{ msg }}</p>
    </form>

    <div class="meta-bloco" v-for="meta in metas" :key="meta.id">
      <div class="linha" style="border: none; padding-bottom: 0">
        <strong>🎯 {{ [meta.titulo, meta.marca, meta.modelo].filter(Boolean).join(" ") }}</strong>
        <span>{{ real(meta.valor_guardado) }} de {{ real(meta.valor_alvo) }} ({{ meta.progresso.percentual }}%)</span>
      </div>
      <div class="barra"><div :style="{ width: meta.progresso.percentual + '%' }"></div></div>
      <p class="subtitulo" v-if="meta.melhor_oferta">
        Última busca: <strong>{{ real(meta.melhor_oferta.preco) }}</strong> em {{ meta.melhor_oferta.data }}
      </p>

      <button class="mini" @click="guardar(meta)">💵 Guardar</button>{{ " " }}
      <button class="mini suave" :disabled="buscando[meta.id]" @click="buscarPrecos(meta)">
        {{ buscando[meta.id] ? "Buscando..." : "🔎 Menor preço" }}
      </button>{{ " " }}
      <button class="mini perigo" @click="apagar(meta)">🗑</button>

      <template v-if="ofertas[meta.id]">
        <p class="aviso" v-if="ofertas[meta.id].frase">{{ ofertas[meta.id].frase }}</p>
        <div class="oferta" v-for="oferta in ofertas[meta.id].lista" :key="oferta.link">
          <strong>{{ real(oferta.preco) }}</strong> — {{ oferta.titulo }} ({{ oferta.condicao }})
          — <a :href="oferta.link" target="_blank" rel="noopener">ver anúncio / contato 🔗</a>
        </div>
      </template>
    </div>
    <em v-if="metas.length === 0" class="subtitulo">Nenhuma meta ainda — crie a primeira acima!</em>
  </section>
</template>

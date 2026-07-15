<script setup>
/**
 * Vitrine de promoções: o sistema varre categorias populares no
 * Mercado Livre e mostra só o que está com desconto de verdade.
 */
import { onMounted, ref } from "vue";
import { api, real } from "../api.js";

const promocoes = ref([]);
const carregando = ref(true);
const msg = ref("");

async function carregar() {
  carregando.value = true;
  msg.value = "";
  try {
    promocoes.value = await api("/promocoes");
    if (promocoes.value.length === 0) {
      msg.value = "Nenhuma promoção encontrada agora — tente de novo mais tarde.";
    }
  } catch (erro) {
    msg.value = erro.message;
  } finally {
    carregando.value = false;
  }
}

onMounted(carregar);
</script>

<template>
  <section class="card">
    <h2>🔥 Promoções do dia</h2>
    <p class="subtitulo">
      Varremos as categorias mais buscadas e mostramos só o que está com
      desconto real — clique para ver o anúncio.
    </p>

    <em v-if="carregando" class="subtitulo">Caçando descontos...</em>
    <p v-else-if="msg" class="msg">{{ msg }}</p>

    <div class="promos">
      <a
        v-for="promo in promocoes"
        :key="promo.link + promo.titulo"
        class="promo"
        :href="promo.link"
        target="_blank"
        rel="noopener"
      >
        <span class="promo__desconto">-{{ promo.desconto }}%</span>
        <span class="promo__titulo">{{ promo.titulo }}</span>
        <span class="promo__precos">
          <s>{{ real(promo.preco_original) }}</s>
          <strong>{{ real(promo.preco) }}</strong>
        </span>
      </a>
    </div>

    <button class="suave" @click="carregar" :disabled="carregando" style="margin-top: 0.9rem">
      🔄 Atualizar promoções
    </button>
  </section>
</template>

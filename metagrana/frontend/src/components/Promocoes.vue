<script setup>
/**
 * Vitrine de promoções com FILTRO por categoria.
 *
 * O pedido do Guilherme: a pessoa escolhe o que quer receber de promoção.
 * Então há um filtro em cima — clica em "Games" e vê só descontos de games.
 * "Tudo" mostra a vitrine completa. Cada card leva DIRETO ao anúncio.
 */
import { computed, onMounted, ref } from "vue";
import { api, real } from "../api.js";

const promocoes = ref([]);
const carregando = ref(true);
const msg = ref("");
const filtro = ref("tudo");

// Categorias do filtro + as palavras que identificam cada uma no título.
const FILTROS = [
  { id: "tudo", nome: "🛍️ Tudo", termos: [] },
  { id: "eletronico", nome: "📱 Eletrônicos", termos: ["celular", "smartphone", "notebook", "tv", "fone", "tablet", "galaxy", "iphone"] },
  { id: "games", nome: "🎮 Games", termos: ["playstation", "xbox", "nintendo", "console", "controle", "ps5"] },
  { id: "casa", nome: "🏠 Casa", termos: ["geladeira", "fogão", "air fryer", "máquina", "aspirador", "micro-ondas", "ar-condicionado"] },
];

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

const promocoesVisiveis = computed(() => {
  if (filtro.value === "tudo") return promocoes.value;
  const termos = FILTROS.find((f) => f.id === filtro.value)?.termos ?? [];
  return promocoes.value.filter((p) =>
    termos.some((t) => p.titulo.toLowerCase().includes(t))
  );
});

onMounted(carregar);
</script>

<template>
  <section class="card">
    <h2>🔥 Promoções do dia</h2>
    <p class="subtitulo">Escolha o que você quer receber — mostramos só descontos reais, direto no anúncio.</p>

    <div class="filtro-promo">
      <button v-for="f in FILTROS" :key="f.id"
              :class="{ ativo: filtro === f.id }" @click="filtro = f.id">
        {{ f.nome }}
      </button>
    </div>

    <em v-if="carregando" class="subtitulo">Caçando descontos...</em>
    <p v-else-if="msg" class="msg">{{ msg }}</p>
    <p v-else-if="promocoesVisiveis.length === 0" class="subtitulo">
      Nenhuma promoção nesta categoria agora — experimente outra ou "Tudo".
    </p>

    <div class="promos">
      <a v-for="promo in promocoesVisiveis" :key="promo.link + promo.titulo"
         class="promo" :href="promo.link" target="_blank" rel="noopener">
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

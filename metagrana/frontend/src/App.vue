<script setup>
/**
 * App.vue — casca do MetaGrana.
 *
 * Duas abas para não virar um scroll infinito: "Meu dinheiro" (o controle
 * pessoal: resumo, gastos, metas, dicas) e "Caçar preços" (a busca por
 * categoria + promoções). Cada aba tem um propósito claro.
 */
import { ref } from "vue";
import Resumo from "./components/Resumo.vue";
import Gastos from "./components/Gastos.vue";
import Metas from "./components/Metas.vue";
import Promocoes from "./components/Promocoes.vue";
import Dicas from "./components/Dicas.vue";
import Buscar from "./components/Buscar.vue";

const aba = ref("dinheiro");

// "sinal" simples para os painéis se atualizarem entre si.
const versao = ref(0);
const atualizar = () => { versao.value++; };
</script>

<template>
  <header class="topo">
    <img :src="'icone.svg'" alt="" />
    <div>
      <h1>MetaGrana</h1>
      <p>Controle seus gastos e cace os menores preços — para todas as idades e bolsos.</p>
    </div>
  </header>

  <nav class="abas">
    <button :class="{ ativa: aba === 'dinheiro' }" @click="aba = 'dinheiro'">💰 Meu dinheiro</button>
    <button :class="{ ativa: aba === 'cacar' }" @click="aba = 'cacar'">🔎 Caçar preços</button>
  </nav>

  <main class="conteudo">
    <template v-if="aba === 'dinheiro'">
      <Resumo class="largo" :versao="versao" />
      <Gastos @mudou="atualizar" :versao="versao" />
      <Metas @mudou="atualizar" :versao="versao" />
      <Dicas class="largo" />
    </template>

    <template v-else>
      <Buscar />
      <Promocoes class="largo" />
    </template>
  </main>
</template>

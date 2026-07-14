<script setup>
/**
 * App.vue — casca do MetaGrana: topo + grade de painéis.
 * Cada painel é um componente independente que conversa com a API.
 */
import { ref } from "vue";
import Resumo from "./components/Resumo.vue";
import Gastos from "./components/Gastos.vue";
import Metas from "./components/Metas.vue";
import Dicas from "./components/Dicas.vue";

// "sinal" simples para os painéis se atualizarem entre si:
// registrar um gasto atualiza o resumo; criar meta atualiza a lista etc.
const versao = ref(0);
const atualizar = () => { versao.value++; };
</script>

<template>
  <header class="topo">
    <img src="/icone.svg" alt="" />
    <div>
      <h1>MetaGrana</h1>
      <p>Controle seus gastos do mês e deixe o sistema caçar os menores preços das suas metas.</p>
    </div>
  </header>

  <main class="conteudo">
    <Resumo class="largo" :versao="versao" />
    <Gastos @mudou="atualizar" :versao="versao" />
    <Metas @mudou="atualizar" :versao="versao" />
    <Dicas class="largo" />
  </main>
</template>

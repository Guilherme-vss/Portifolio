<script setup>
/**
 * Buscar.vue — o caçador de preços com menu de categorias.
 *
 * Fluxo (pedido do Guilherme): categoria → subcategoria → detalhe.
 * carro > Honda > Civic. O menu monta o termo de busca preciso, e o resultado
 * mostra cada oferta com a FONTE embaixo e um link que vai DIRETO ao produto.
 */
import { ref } from "vue";
import { api, real } from "../api.js";
import { CATEGORIAS, iconeCategoria, termoDeBusca } from "../categorias.js";

const categoria = ref(null); // nível 1
const sub = ref(null);       // nível 2
const folha = ref(null);     // nível 3 (o termo final)
const termoLivre = ref("");  // busca digitada, alternativa ao menu

const resultado = ref(null);
const carregando = ref(false);
const msg = ref("");

function escolherCategoria(c) {
  categoria.value = c;
  sub.value = null;
  folha.value = null;
}

function escolherSub(s) {
  sub.value = s;
  folha.value = null;
}

async function buscarFolha(f) {
  folha.value = f;
  const termo = termoDeBusca(categoria.value, sub.value, f);
  await executar(termo, categoria.value?.id);
}

async function buscarLivre() {
  if (!termoLivre.value.trim()) return;
  await executar(termoLivre.value.trim(), null);
}

async function executar(termo, cat) {
  carregando.value = true;
  msg.value = "";
  resultado.value = null;
  try {
    const url = `/buscar?termo=${encodeURIComponent(termo)}${cat ? `&categoria=${cat}` : ""}`;
    resultado.value = { termo, ...(await api(url)) };
  } catch (e) {
    msg.value = e.message;
  } finally {
    carregando.value = false;
  }
}

function voltar() {
  if (folha.value) folha.value = null;
  else if (sub.value) sub.value = null;
  else categoria.value = null;
  resultado.value = null;
}
</script>

<template>
  <section class="card largo">
    <h2>🔎 Caçar preços</h2>
    <p class="subtitulo">Escolha o que você procura — quanto mais específico, melhor o preço encontrado.</p>

    <!-- Trilha de navegação -->
    <div class="trilha" v-if="categoria">
      <button class="link" @click="voltar">← Voltar</button>
      <span>
        {{ categoria.icone }} {{ categoria.nome }}
        <template v-if="sub"> › {{ sub.nome }}</template>
        <template v-if="folha"> › <strong>{{ folha }}</strong></template>
      </span>
    </div>

    <!-- Nível 1: categorias -->
    <div class="grade-categorias" v-if="!categoria">
      <button v-for="c in CATEGORIAS" :key="c.id" class="categoria-btn" @click="escolherCategoria(c)">
        <span class="categoria-icone">{{ c.icone }}</span>
        {{ c.nome }}
      </button>
    </div>

    <!-- Nível 2: subcategorias -->
    <div class="grade-chips" v-else-if="!sub">
      <button v-for="s in categoria.filhos" :key="s.id" class="chip" @click="escolherSub(s)">
        {{ s.nome }} ›
      </button>
    </div>

    <!-- Nível 3: folhas (o termo final) -->
    <div class="grade-chips" v-else>
      <button v-for="f in sub.filhos" :key="f" class="chip"
              :class="{ ativo: folha === f }" @click="buscarFolha(f)">
        {{ f }}
      </button>
    </div>

    <!-- Busca livre -->
    <div class="busca-livre" v-if="!categoria">
      <input v-model="termoLivre" placeholder="ou digite direto: ex. cadeira gamer"
             @keydown.enter="buscarLivre" />
      <button @click="buscarLivre">Buscar</button>
    </div>
  </section>

  <!-- Resultado -->
  <section class="card largo" v-if="carregando || resultado || msg">
    <em v-if="carregando" class="subtitulo">Procurando "{{ resultado?.termo }}" nas lojas...</em>
    <p v-else-if="msg" class="msg erro">{{ msg }}</p>

    <template v-if="resultado && !carregando">
      <h2>{{ iconeCategoria(categoria?.id) }} Resultados para "{{ resultado.termo }}"</h2>
      <p class="aviso" v-if="resultado.aviso">{{ resultado.aviso }}</p>

      <!-- Ofertas com preço real (Mercado Livre) -->
      <div class="ofertas-grade" v-if="resultado.com_preco.length">
        <a v-for="(o, i) in resultado.com_preco" :key="o.link + i"
           class="oferta-card" :class="{ melhor: i === 0 }"
           :href="o.link" target="_blank" rel="noopener">
          <span class="oferta-badge" v-if="i === 0">🏆 Menor preço</span>
          <strong class="oferta-preco">{{ real(o.preco) }}</strong>
          <span class="oferta-titulo">{{ o.titulo }}</span>
          <span class="oferta-rodape">
            <span class="oferta-fonte">🛒 {{ o.fonte }}</span>
            <span class="oferta-cond">{{ o.condicao }}</span>
          </span>
        </a>
      </div>

      <!-- Outras lojas: link de busca profunda ao produto -->
      <h3 class="section-lojas">Comparar em outras lojas</h3>
      <p class="subtitulo">Um clique já cai na busca deste produto, ordenada pelo menor preço.</p>
      <div class="lojas-grade">
        <a v-for="l in resultado.outras_lojas" :key="l.fonte"
           class="loja-card" :href="l.link" target="_blank" rel="noopener">
          <strong>{{ l.fonte }}</strong>
          <span>ver ofertas →</span>
        </a>
      </div>
    </template>
  </section>
</template>

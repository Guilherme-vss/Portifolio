/**
 * main.js — Interações da página.
 *
 * Menu, digitação, barra de rolagem, contadores, revelação com cadência,
 * painel "Por que me contratar?" e os repositórios do GitHub
 * (a lógica de dados vive em api.js, onde é testável).
 */

// ----- Menu hambúrguer (celular) -----
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});

// ----- Barra de progresso da rolagem -----
const barraScroll = document.getElementById("scroll-progresso");

window.addEventListener("scroll", () => {
  const alturaRolavel = document.documentElement.scrollHeight - window.innerHeight;
  const percentual = alturaRolavel > 0 ? (window.scrollY / alturaRolavel) * 100 : 0;
  barraScroll.style.width = percentual + "%";
}, { passive: true });

// ----- Efeito de digitação no papel do hero -----
const papeis = ["Full-Stack", "Back-end", "Front-end", "Poliglota 🧩"];
const alvoDigitado = document.getElementById("papel-digitado");

let indicePapel = 0;
let indiceLetra = 0;
let apagando = false;

function digitar() {
  const palavra = papeis[indicePapel];
  alvoDigitado.textContent = palavra.slice(0, indiceLetra);

  if (!apagando) {
    indiceLetra++;
    if (indiceLetra > palavra.length) {
      apagando = true;
      setTimeout(digitar, 1600);
      return;
    }
  } else {
    indiceLetra--;
    if (indiceLetra === 0) {
      apagando = false;
      indicePapel = (indicePapel + 1) % papeis.length;
    }
  }
  setTimeout(digitar, apagando ? 45 : 90);
}

if (alvoDigitado) digitar();

// ----- Contadores que sobem quando entram na tela -----
function animarContador(elemento) {
  const alvo = Number(elemento.dataset.alvo) || 0;
  const sufixo = elemento.dataset.sufixo || "";
  const duracao = 1200;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min(1, (agora - inicio) / duracao);
    const suave = 1 - Math.pow(1 - progresso, 3); // desacelera no final
    elemento.textContent = Math.round(alvo * suave) + sufixo;
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

// ----- Revelação com cadência (efeito cascata) -----
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const el = entrada.target;
      const irmaos = [...el.parentElement.children].filter((f) => f.classList.contains("revelar"));
      const ordem = Math.max(0, irmaos.indexOf(el));
      setTimeout(() => {
        el.classList.add("visivel");
        el.querySelectorAll(".contador").forEach(animarContador);
      }, ordem * 110);
      observador.unobserve(el);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".revelar").forEach((el) => observador.observe(el));

// ----- Por que me contratar? (painel dinâmico) -----
const argumentos = {
  fullstack: {
    titulo: "🧩 Do banco ao botão: eu cubro o caminho inteiro",
    texto:
      "Times pequenos não têm espaço para 'isso não é comigo'. Eu modelo o banco, " +
      "escrevo a API, monto a interface e deixo tudo rodando em Docker — a mesma " +
      "pessoa que entende o problema entrega a solução completa.",
    prova: "Prova neste portfólio: 4 sistemas completos, cada um com banco + API + front + CI.",
  },
  frontend: {
    titulo: "🎨 Interfaces que o usuário entende de primeira",
    texto:
      "Front-end para mim é empatia: botão claro, resposta imediata, funciona no " +
      "celular. E não fico preso a um framework — falo os quatro mais usados do mercado.",
    prova: "Prova: React (RotaKids), Vue (MetaGrana), Angular (Planify) e Svelte (CorteCerto), todos responsivos.",
  },
  backend: {
    titulo: "⚙️ APIs que aguentam o mundo real",
    texto:
      "Validação em toda borda, senhas com hash, SQL parametrizado, erros que explicam " +
      "em vez de assustar — e arquitetura que o próximo dev agradece (DDD, DTOs, portas e adaptadores).",
    prova: "Prova: Planify em DDD com camadas isoladas; CorteCerto com microsserviço Python dedicado ao cálculo.",
  },
  devops: {
    titulo: "🚢 'Funciona na minha máquina' não existe aqui",
    texto:
      "Cada projeto sobe com um comando (docker compose up) e tem pipeline Jenkins: " +
      "dependências, testes e imagem Docker a cada mudança. Entregar não é evento, é rotina.",
    prova: "Prova: 5 Dockerfiles, 5 Jenkinsfiles e mais de 120 testes automatizados neste repositório.",
  },
  aprendizado: {
    titulo: "📚 Stack nova? Me dá uma semana",
    texto:
      "Este portfólio usa 8 linguagens/frameworks — e vários deles eu aprendi construindo " +
      "exatamente estes projetos. Aprender rápido não é promessa de entrevista: está versionado no Git.",
    prova: "Prova: TypeScript, Python, Java, C#, React, Vue, Angular e Svelte no mesmo repositório.",
  },
};

const botoesPorque = document.querySelectorAll(".porque__botao");
const painelPorque = document.getElementById("porque-painel");

function mostrarArgumento(chave) {
  const argumento = argumentos[chave];
  if (!argumento) return;
  painelPorque.classList.remove("trocando");
  void painelPorque.offsetWidth; // reinicia a animação
  painelPorque.classList.add("trocando");
  document.getElementById("porque-titulo").textContent = argumento.titulo;
  document.getElementById("porque-texto").textContent = argumento.texto;
  document.getElementById("porque-prova").textContent = argumento.prova;
}

botoesPorque.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesPorque.forEach((b) => b.classList.remove("ativa"));
    botao.classList.add("ativa");
    mostrarArgumento(botao.dataset.chave);
  });
});

if (painelPorque) mostrarArgumento("fullstack");

// ----- Repositórios do GitHub -----
function repoCard(repo) {
  const card = document.createElement("a");
  card.className = "repo";
  card.href = repo.url;
  card.target = "_blank";
  card.rel = "noopener";
  card.innerHTML = `
    <span class="repo__name">${repo.name}</span>
    <p class="repo__desc"></p>
    <div class="repo__meta">
      <span class="repo__lang">${repo.language}</span>
      <span>⭐ ${repo.stars}</span>
    </div>
  `;
  // textContent evita injeção de HTML vinda da descrição do repositório
  card.querySelector(".repo__desc").textContent = repo.description;
  return card;
}

async function loadRepos() {
  const container = document.getElementById("repos");
  try {
    const repos = await fetchRepos();
    container.innerHTML = "";
    if (repos.length === 0) {
      container.innerHTML = '<p class="repos__error">Nenhum repositório público encontrado.</p>';
      return;
    }
    repos.forEach((repo) => container.appendChild(repoCard(repo)));
  } catch (err) {
    container.innerHTML =
      '<p class="repos__error">Não consegui carregar os repositórios agora 😕 — ' +
      "verifique o usuário configurado em <code>js/api.js</code> ou tente mais tarde.</p>";
    console.error("Erro ao buscar repositórios:", err);
  }
}

loadRepos();

// rotina interna do núcleo
const s = "UG9ydGZvbGlvIGlkZWFsaXphZG8gZSBkaXJpZ2lkbyBwb3IgR3VpbGhlcm1lIFNvdXphIChAR3VpbGhlcm1lLXZzcykuIFNlIHZvY2UgYWNob3UgaXNzbywgbWUgY2hhbWEgcHJhIGNvbnZlcnNhciEgMjAyNg==";
const teclas = [];
window.addEventListener("keydown", (evento) => {
  teclas.push((evento.key || "").toLowerCase());
  if (teclas.slice(-5).join("") === "guizi") {
    console.log("%c🥚 " + atob(s), "color:#4f8cff;font-size:16px;font-weight:bold");
  }
  if (teclas.length > 16) teclas.shift();
});

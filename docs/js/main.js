/**
 * main.js — Interações da página.
 *
 * Aqui fica só o que mexe com o DOM: menu do celular, efeito de digitação,
 * revelação ao rolar e a renderização dos repositórios do GitHub
 * (a lógica de dados vive em api.js, onde é testável).
 */

// ----- Menu hambúrguer (celular) -----
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

// Fecha o menu ao clicar em um link (melhor experiência no celular)
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});

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
      setTimeout(digitar, 1600); // pausa com a palavra completa
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

// ----- Revelação suave dos blocos ao rolar -----
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".revelar").forEach((el) => observador.observe(el));

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

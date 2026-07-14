/**
 * main.js — Interações da página.
 *
 * Aqui fica só o que mexe com o DOM: menu do celular e a renderização
 * dos repositórios vindos da API do GitHub (lógica em api.js).
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

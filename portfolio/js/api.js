/**
 * api.js — Integração com a API pública do GitHub.
 *
 * Este arquivo concentra toda a lógica "pura" (sem DOM) para que ela possa
 * ser testada com Jest sem precisar de navegador. O main.js cuida da tela.
 */

/** Usuário do GitHub exibido no portfólio. Troque pelo seu! */
const GITHUB_USER = "SEU-USUARIO";

/** Endpoint da API do GitHub para listar repositórios públicos de um usuário. */
function buildReposUrl(user) {
  if (!user || typeof user !== "string" || !user.trim()) {
    throw new Error("Usuário do GitHub inválido");
  }
  return `https://api.github.com/users/${encodeURIComponent(user.trim())}/repos?sort=updated&per_page=12`;
}

/**
 * Converte a resposta crua da API em objetos simples usados pela interface.
 * Repositórios que são forks ficam de fora — o portfólio mostra só o que é seu.
 */
function parseRepos(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((repo) => repo && !repo.fork)
    .map((repo) => ({
      name: repo.name,
      description: repo.description || "Sem descrição (ainda!)",
      url: repo.html_url,
      language: repo.language || "—",
      stars: repo.stargazers_count || 0,
    }));
}

/** Ordena os repositórios: mais estrelas primeiro, empate decidido pelo nome. */
function sortByStars(repos) {
  return [...repos].sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
}

/** Busca os repositórios na API do GitHub. Lança erro se a resposta falhar. */
async function fetchRepos(user = GITHUB_USER) {
  const response = await fetch(buildReposUrl(user));
  if (!response.ok) {
    throw new Error(`GitHub respondeu ${response.status}`);
  }
  const data = await response.json();
  return sortByStars(parseRepos(data));
}

/* Exporta para os testes (Node/Jest). No navegador, vira variável global. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GITHUB_USER, buildReposUrl, parseRepos, sortByStars, fetchRepos };
}

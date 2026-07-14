/**
 * Testes unitários da camada de API do portfólio (Jest).
 * Rode com: npm test
 */
const { buildReposUrl, parseRepos, sortByStars, fetchRepos } = require("../js/api");

describe("buildReposUrl", () => {
  test("monta a URL correta para um usuário válido", () => {
    expect(buildReposUrl("octocat")).toBe(
      "https://api.github.com/users/octocat/repos?sort=updated&per_page=12"
    );
  });

  test("remove espaços extras do usuário", () => {
    expect(buildReposUrl("  octocat  ")).toContain("/users/octocat/");
  });

  test("lança erro para usuário vazio ou inválido", () => {
    expect(() => buildReposUrl("")).toThrow("Usuário do GitHub inválido");
    expect(() => buildReposUrl(null)).toThrow();
    expect(() => buildReposUrl("   ")).toThrow();
  });
});

describe("parseRepos", () => {
  const cru = [
    { name: "meu-app", description: "Um app", html_url: "https://x", language: "TypeScript", stargazers_count: 5, fork: false },
    { name: "fork-alheio", description: "fork", html_url: "https://y", language: "Java", stargazers_count: 99, fork: true },
    { name: "sem-descricao", description: null, html_url: "https://z", language: null, stargazers_count: 0, fork: false },
  ];

  test("ignora forks", () => {
    const repos = parseRepos(cru);
    expect(repos).toHaveLength(2);
    expect(repos.map((r) => r.name)).not.toContain("fork-alheio");
  });

  test("preenche descrição e linguagem padrão quando ausentes", () => {
    const semDesc = parseRepos(cru).find((r) => r.name === "sem-descricao");
    expect(semDesc.description).toBe("Sem descrição (ainda!)");
    expect(semDesc.language).toBe("—");
  });

  test("retorna lista vazia para entrada que não é array", () => {
    expect(parseRepos(null)).toEqual([]);
    expect(parseRepos({})).toEqual([]);
  });
});

describe("sortByStars", () => {
  test("ordena por estrelas (desc) e desempata por nome", () => {
    const repos = [
      { name: "b", stars: 3 },
      { name: "a", stars: 3 },
      { name: "c", stars: 10 },
    ];
    expect(sortByStars(repos).map((r) => r.name)).toEqual(["c", "a", "b"]);
  });

  test("não modifica o array original", () => {
    const repos = [{ name: "x", stars: 1 }, { name: "y", stars: 2 }];
    sortByStars(repos);
    expect(repos[0].name).toBe("x");
  });
});

describe("fetchRepos", () => {
  afterEach(() => jest.restoreAllMocks());

  test("busca, converte e ordena os repositórios", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { name: "menor", html_url: "u1", stargazers_count: 1, fork: false },
        { name: "maior", html_url: "u2", stargazers_count: 9, fork: false },
      ],
    });

    const repos = await fetchRepos("octocat");
    expect(repos.map((r) => r.name)).toEqual(["maior", "menor"]);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("octocat"));
  });

  test("lança erro quando a API responde com falha", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchRepos("nao-existe")).rejects.toThrow("GitHub respondeu 404");
  });
});

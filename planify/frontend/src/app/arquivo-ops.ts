/**
 * arquivo-ops.ts — operações de arquivo que rodam 100% no navegador.
 *
 * Honestidade primeiro (regra 3): nem tudo que se faz com arquivo dá para
 * fazer numa aba de navegador. O que É possível e está aqui, funcionando:
 *   - Texto: lista → tabela, padronizar caixa, limpar linhas, numerar.
 *   - Renomear em lote: gera os nomes novos por um padrão E um SCRIPT pronto
 *     (.bat no Windows) que o usuário roda para aplicar de uma vez.
 *
 * O que exige o app de desktop (juntar PDF, ler EXIF de foto, mover arquivos)
 * fica sinalizado na tela — não finjo que roda aqui.
 */

/* ==================== Texto / documentos ==================== */

/** Quebra o texto em linhas não-vazias, aparadas. */
export function linhas(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Título: primeira letra de cada palavra em maiúscula. */
export function paraTitulo(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/(^|[\s-])([a-zà-ú])/g, (_, sep, letra) => sep + letra.toUpperCase());
}

/** Aplica a caixa escolhida ao texto inteiro. */
export function aplicarCaixa(texto: string, caixa: "titulo" | "maiuscula" | "minuscula"): string {
  if (caixa === "maiuscula") return texto.toUpperCase();
  if (caixa === "minuscula") return texto.toLowerCase();
  return linhas(texto).map(paraTitulo).join("\n");
}

/** Numera cada linha: "1. item", "2. item"... */
export function numerarLinhas(texto: string, inicio = 1): string {
  return linhas(texto)
    .map((l, i) => `${i + inicio}. ${l}`)
    .join("\n");
}

/**
 * Lista de texto → tabela. Cada linha é uma linha da tabela; o separador
 * (vírgula, ponto-e-vírgula, tab) é detectado. Devolve matriz para virar
 * CSV/HTML (o Planify já sabe exportar isso).
 */
export function textoParaTabela(texto: string): string[][] {
  return linhas(texto).map((linha) => {
    const sep = linha.includes("\t") ? "\t" : linha.includes(";") ? ";" : ",";
    return linha.split(sep).map((c) => c.trim());
  });
}

/* ==================== Renomear em lote ==================== */

/** Extensão de um nome de arquivo (com o ponto), ou "". */
export function extensao(nome: string): string {
  const i = nome.lastIndexOf(".");
  return i > 0 ? nome.slice(i) : "";
}

/** Data de um arquivo (lastModified) no formato AAAA-MM-DD. */
export function dataArquivo(lastModified: number): string {
  return new Date(lastModified).toISOString().slice(0, 10);
}

/**
 * Gera os nomes novos por um padrão. Tokens disponíveis:
 *   {n}    — número sequencial (com zero à esquerda: {n2} = 01, 02...)
 *   {nome} — nome original sem extensão
 *   {data} — data do arquivo (AAAA-MM-DD)
 *   {ext}  — extensão (o .jpg é sempre preservado se o padrão não tiver {ext})
 *
 * Ex.: "viagem-{n3}" em 2 fotos → viagem-001.jpg, viagem-002.jpg
 */
export function gerarNomes(
  arquivos: { name: string; lastModified: number }[],
  padrao: string,
  inicio = 1
): { de: string; para: string }[] {
  return arquivos.map((arq, i) => {
    const ext = extensao(arq.name);
    const nomeBase = ext ? arq.name.slice(0, -ext.length) : arq.name;

    let novo = padrao
      .replace(/\{n(\d+)\}/g, (_, casas) => String(i + inicio).padStart(Number(casas), "0"))
      .replace(/\{n\}/g, String(i + inicio))
      .replace(/\{nome\}/g, nomeBase)
      .replace(/\{data\}/g, dataArquivo(arq.lastModified));

    // Se o padrão não citou a extensão, preserva a original.
    if (!novo.includes("{ext}") && !novo.toLowerCase().endsWith(ext.toLowerCase())) {
      novo += ext;
    }
    novo = novo.replace(/\{ext\}/g, ext);

    return { de: arq.name, para: novo };
  });
}

/**
 * Script .bat (Windows) que aplica os renomeamentos — o usuário salva e dá
 * dois cliques. É a ponte honesta entre "o navegador não move arquivos" e
 * "resolvi seu problema de verdade".
 */
export function scriptRenomear(nomes: { de: string; para: string }[]): string {
  const linhas = [
    "@echo off",
    "chcp 65001 > nul",
    "rem Script gerado pelo Planify — coloque na MESMA pasta dos arquivos e execute.",
    "",
  ];
  for (const { de, para } of nomes) {
    if (de !== para) linhas.push(`ren "${de}" "${para}"`);
  }
  linhas.push("", "echo Pronto! Arquivos renomeados.", "pause");
  return linhas.join("\r\n");
}

/** Plano de organização por data: qual arquivo vai para qual pasta (AAAA/MM). */
export function agruparPorData(
  arquivos: { name: string; lastModified: number }[]
): { pasta: string; arquivos: string[] }[] {
  const mapa = new Map<string, string[]>();
  for (const arq of arquivos) {
    const d = new Date(arq.lastModified);
    const pasta = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!mapa.has(pasta)) mapa.set(pasta, []);
    mapa.get(pasta)!.push(arq.name);
  }
  return [...mapa.entries()]
    .map(([pasta, arquivos]) => ({ pasta, arquivos }))
    .sort((a, b) => a.pasta.localeCompare(b.pasta));
}

/** Script .bat que cria as pastas por data e move os arquivos. */
export function scriptOrganizarPorData(
  grupos: { pasta: string; arquivos: string[] }[]
): string {
  const linhas = ["@echo off", "chcp 65001 > nul", "rem Gerado pelo Planify — execute na pasta dos arquivos.", ""];
  for (const g of grupos) {
    const pastaWin = g.pasta.replace("/", "\\");
    linhas.push(`if not exist "${pastaWin}" mkdir "${pastaWin}"`);
    for (const arq of g.arquivos) linhas.push(`move "${arq}" "${pastaWin}\\"`);
    linhas.push("");
  }
  linhas.push("echo Pronto! Arquivos organizados por data.", "pause");
  return linhas.join("\r\n");
}

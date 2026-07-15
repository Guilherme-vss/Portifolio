/**
 * util.ts — funções puras da interface (testadas com Vitest, sem Angular).
 */

/** Só aceitamos os formatos que o backend sabe ler. */
export function arquivoSuportado(nome: string | undefined | null): boolean {
  if (!nome) return false;
  const minusculo = nome.toLowerCase();
  return minusculo.endsWith(".csv") || minusculo.endsWith(".xlsx");
}

/** Percentual de linhas que sobraram após a organização (para a métrica). */
export function percentualMantido(antes: number, depois: number): number {
  if (antes <= 0) return 0;
  return Math.round((depois / antes) * 100);
}

/** Data ISO → "13/07/2026 21:45" (formato brasileiro). */
export function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Prepara o conteúdo do CSV para download com BOM (acentos no Excel). */
export function csvParaBlobParts(csv: string): string[] {
  return ["﻿" + csv];
}

/**
 * Converte as linhas numa tabela HTML — é o formato que Excel e Word
 * abrem nativamente (por isso os botões "Baixar Excel/Word" funcionam
 * sem nenhuma biblioteca externa).
 */
export function tabelaParaHtml(linhas: string[][], titulo = "Planilha organizada"): string {
  const escapar = (texto: string) =>
    texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const corpo = linhas
    .map((linha, indice) => {
      const marcador = indice === 0 ? "th" : "td";
      const celulas = linha
        .map((celula) => `<${marcador} style="border:1px solid #999;padding:4px 8px">${escapar(celula)}</${marcador}>`)
        .join("");
      return `<tr>${celulas}</tr>`;
    })
    .join("");

  return (
    `<html><head><meta charset="utf-8"><title>${escapar(titulo)}</title></head>` +
    `<body><table style="border-collapse:collapse;font-family:Segoe UI,sans-serif;font-size:13px">${corpo}</table></body></html>`
  );
}

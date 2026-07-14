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

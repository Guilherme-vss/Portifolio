/** Testes das funções puras do front do Planify. Rode com: npm test */
import { describe, expect, test } from "vitest";
import { arquivoSuportado, csvParaBlobParts, formatarData, percentualMantido, tabelaParaHtml } from "./util";

describe("arquivoSuportado", () => {
  test("aceita .csv e .xlsx em qualquer caixa", () => {
    expect(arquivoSuportado("dados.csv")).toBe(true);
    expect(arquivoSuportado("Relatorio.XLSX")).toBe(true);
  });
  test("recusa outros formatos e valores vazios", () => {
    expect(arquivoSuportado("foto.png")).toBe(false);
    expect(arquivoSuportado("")).toBe(false);
    expect(arquivoSuportado(null)).toBe(false);
  });
});

describe("percentualMantido", () => {
  test("calcula a proporção de linhas que sobraram", () => {
    expect(percentualMantido(100, 80)).toBe(80);
    expect(percentualMantido(3, 3)).toBe(100);
  });
  test("evita divisão por zero", () => {
    expect(percentualMantido(0, 0)).toBe(0);
  });
});

describe("formatarData", () => {
  test("formata a data no padrão brasileiro", () => {
    const texto = formatarData("2026-07-13T21:45:00");
    expect(texto).toContain("13/07/2026");
  });
  test("data inválida vira travessão", () => {
    expect(formatarData("não é data")).toBe("—");
  });
});

describe("tabelaParaHtml", () => {
  test("primeira linha vira cabeçalho <th> e as demais <td>", () => {
    const html = tabelaParaHtml([["nome"], ["Ana"]]);
    expect(html).toContain("<th");
    expect(html).toContain(">nome</th>");
    expect(html).toContain(">Ana</td>");
  });
  test("escapa HTML das células (segurança)", () => {
    const html = tabelaParaHtml([["a"], ["<script>alert(1)</script>"]]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("csvParaBlobParts", () => {
  test("prefixa o BOM para o Excel abrir acentos corretamente", () => {
    const [parte] = csvParaBlobParts("nome;idade");
    expect(parte.charCodeAt(0)).toBe(0xfeff);
    expect(parte).toContain("nome;idade");
  });
});

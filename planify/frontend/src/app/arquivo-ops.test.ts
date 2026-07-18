/** Testes das operações de arquivo do navegador. */
import { describe, expect, test } from "vitest";
import {
  agruparPorData,
  aplicarCaixa,
  extensao,
  gerarNomes,
  numerarLinhas,
  scriptRenomear,
  textoParaTabela,
} from "./arquivo-ops";

describe("texto", () => {
  test("aplica caixa Título, MAIÚSCULA e minúscula", () => {
    expect(aplicarCaixa("ana LIMA", "titulo")).toBe("Ana Lima");
    expect(aplicarCaixa("ana", "maiuscula")).toBe("ANA");
    expect(aplicarCaixa("ANA", "minuscula")).toBe("ana");
  });

  test("numera as linhas ignorando vazias", () => {
    expect(numerarLinhas("maçã\n\nbanana")).toBe("1. maçã\n2. banana");
  });

  test("texto vira tabela detectando o separador", () => {
    expect(textoParaTabela("nome;idade\nAna;30")).toEqual([["nome", "idade"], ["Ana", "30"]]);
    expect(textoParaTabela("a,b")).toEqual([["a", "b"]]);
  });
});

describe("extensao", () => {
  test("extrai a extensão com o ponto", () => {
    expect(extensao("foto.JPG")).toBe(".JPG");
    expect(extensao("semponto")).toBe("");
    expect(extensao(".gitignore")).toBe(""); // arquivo oculto, não é extensão
  });
});

describe("gerarNomes", () => {
  const arquivos = [
    { name: "DSC001.jpg", lastModified: Date.parse("2026-07-17") },
    { name: "DSC002.jpg", lastModified: Date.parse("2026-07-18") },
  ];

  test("padrão com número sequencial e zero à esquerda", () => {
    const r = gerarNomes(arquivos, "viagem-{n3}");
    expect(r[0].para).toBe("viagem-001.jpg"); // preserva a extensão
    expect(r[1].para).toBe("viagem-002.jpg");
  });

  test("token de data e nome original", () => {
    const r = gerarNomes(arquivos, "{data}_{nome}");
    expect(r[0].para).toBe("2026-07-17_DSC001.jpg");
  });

  test("borda: padrão vazio ainda preserva a extensão", () => {
    const r = gerarNomes([arquivos[0]], "{n}");
    expect(r[0].para).toBe("1.jpg");
  });
});

describe("scriptRenomear", () => {
  test("gera comandos ren só para o que mudou", () => {
    const script = scriptRenomear([
      { de: "a.jpg", para: "foto-1.jpg" },
      { de: "b.jpg", para: "b.jpg" }, // não mudou: não entra
    ]);
    expect(script).toContain('ren "a.jpg" "foto-1.jpg"');
    expect(script).not.toContain('ren "b.jpg"');
  });
});

describe("agruparPorData", () => {
  test("separa arquivos em pastas AAAA/MM", () => {
    const grupos = agruparPorData([
      { name: "a.pdf", lastModified: Date.parse("2026-07-10") },
      { name: "b.pdf", lastModified: Date.parse("2026-08-02") },
      { name: "c.pdf", lastModified: Date.parse("2026-07-25") },
    ]);
    expect(grupos).toHaveLength(2);
    expect(grupos[0].pasta).toBe("2026/07");
    expect(grupos[0].arquivos).toEqual(["a.pdf", "c.pdf"]);
    expect(grupos[1].pasta).toBe("2026/08");
  });
});

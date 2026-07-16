/** Testes do motor local do Planify (profiling + resumo financeiro + parse). */
import { describe, expect, test } from "vitest";
import { lerCsv, numeroOuNulo, perfilar, resumoFinanceiro } from "./motor-local";

describe("lerCsv", () => {
  test("detecta ponto-e-vírgula (padrão Excel brasileiro)", () => {
    expect(lerCsv("nome;idade\nAna;30")).toEqual([["nome", "idade"], ["Ana", "30"]]);
  });
  test("cai para vírgula quando não há ponto-e-vírgula", () => {
    expect(lerCsv("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("numeroOuNulo", () => {
  test("entende R$ e formato brasileiro", () => {
    expect(numeroOuNulo("R$ 1.234,56")).toBe(1234.56);
    expect(numeroOuNulo("89,90")).toBe(89.9);
  });
  test("texto não-numérico vira null", () => {
    expect(numeroOuNulo("abacaxi")).toBeNull();
    expect(numeroOuNulo("")).toBeNull();
  });
});

describe("perfilar", () => {
  const linhas = [
    ["nome", "valor"],
    ["Ana", "100"],
    ["Bruno", ""],
    ["Carla", "300"],
  ];

  test("detecta tipo e estatísticas de coluna numérica", () => {
    const perfil = perfilar(linhas);
    const valor = perfil[1];
    expect(valor.tipo).toBe("NUMERO");
    expect(valor.soma).toBe(400);
    expect(valor.media).toBe(200);
    expect(valor.vazias).toBe(1);
    expect(valor.percentualPreenchido).toBe(67);
  });

  test("coluna de texto conta distintos", () => {
    expect(perfilar(linhas)[0].tipo).toBe("TEXTO");
    expect(perfilar(linhas)[0].distintos).toBe(3);
  });

  test("detecta moeda pelo R$", () => {
    expect(perfilar([["preco"], ["R$ 10,00"], ["R$ 20,00"]])[0].tipo).toBe("MOEDA");
  });

  test("detecta data pelo padrão dd/MM/yyyy", () => {
    expect(perfilar([["dt"], ["05/03/2026"], ["15/12/2026"]])[0].tipo).toBe("DATA");
  });
});

describe("resumoFinanceiro", () => {
  const linhas = [
    ["categoria", "gasto"],
    ["mercado", "400"],
    ["lazer", "120"],
    ["mercado", "R$ 100,00"],
  ];

  test("soma por categoria, do maior para o menor", () => {
    const resumo = resumoFinanceiro(linhas, 0, 1)!;
    expect(resumo.total).toBe(620);
    expect(resumo.grupos[0].categoria).toBe("mercado");
    expect(resumo.grupos[0].soma).toBe(500);
    expect(resumo.grupos[0].itens).toBe(2);
  });

  test("colunas inválidas devolvem null", () => {
    expect(resumoFinanceiro(linhas, -1, 1)).toBeNull();
  });
});

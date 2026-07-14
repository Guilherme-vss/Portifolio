/** Testes dos helpers do front do MetaGrana. Rode com: npm test */
import { describe, expect, test } from "vitest";
import { fraseVariacao, mesAtual, real, validarMeta } from "./api.js";

describe("real (formatação de dinheiro)", () => {
  test("formata com símbolo, milhar e centavos", () => {
    // toLocaleString usa espaço especial (U+00A0) entre R$ e o número
    expect(real(1234.5).replace(/ /g, " ")).toBe("R$ 1.234,50");
  });
  test("valores nulos viram R$ 0,00", () => {
    expect(real(null)).toContain("0,00");
    expect(real(undefined)).toContain("0,00");
  });
});

describe("mesAtual", () => {
  test("devolve AAAA-MM da data informada", () => {
    expect(mesAtual(new Date("2026-07-13T12:00:00Z"))).toBe("2026-07");
  });
});

describe("fraseVariacao", () => {
  test("frase de queda incentiva a compra", () => {
    const frase = fraseVariacao({ caiu: true, diferenca: -400, percentual: -10 });
    expect(frase).toContain("CAIU");
    expect(frase).toContain("10%");
  });
  test("frase de alta apenas informa", () => {
    expect(fraseVariacao({ caiu: false, diferenca: 50, percentual: 2 })).toContain("subiu");
  });
  test("sem variação devolve null", () => {
    expect(fraseVariacao(null)).toBeNull();
  });
});

describe("validarMeta", () => {
  test("aceita meta completa", () => {
    expect(validarMeta({ titulo: "PS5", valor_alvo: 3500 })).toBeNull();
  });
  test("exige título e valor positivo", () => {
    expect(validarMeta({ titulo: "  ", valor_alvo: 100 })).toMatch(/comprar/);
    expect(validarMeta({ titulo: "PS5", valor_alvo: 0 })).toMatch(/valor/);
    expect(validarMeta({ titulo: "PS5", valor_alvo: -5 })).toMatch(/valor/);
  });
});

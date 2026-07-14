/** Testes dos helpers do front do CorteCerto. Rode com: npm test */
import { describe, expect, test } from "vitest";
import { fraseDoCorte, proximoStatus, statusInfo, validarPedido } from "./api.js";

describe("statusInfo", () => {
  test("conhece todos os status do fluxo", () => {
    expect(statusInfo("recebido").rotulo).toContain("Recebido");
    expect(statusInfo("em_producao").rotulo).toContain("produção");
    expect(statusInfo("pronto").rotulo).toContain("Pronto");
    expect(statusInfo("entregue").rotulo).toContain("Entregue");
  });
  test("status desconhecido não quebra a tela", () => {
    expect(statusInfo("outro").rotulo).toBe("outro");
  });
});

describe("proximoStatus", () => {
  test("avança na ordem do fluxo de produção", () => {
    expect(proximoStatus("recebido")).toBe("em_producao");
    expect(proximoStatus("em_producao")).toBe("pronto");
    expect(proximoStatus("pronto")).toBe("entregue");
  });
  test("entregue é o fim da linha", () => {
    expect(proximoStatus("entregue")).toBeNull();
  });
});

describe("validarPedido", () => {
  const valido = {
    nomeCliente: "Ana", contato: "(11) 9", chapaId: 1,
    medidaCorteCm: "35.7", quantidadePecas: "4",
  };
  test("aceita pedido completo", () => {
    expect(validarPedido(valido)).toBeNull();
  });
  test("aponta cada campo com problema", () => {
    expect(validarPedido({ ...valido, nomeCliente: " " })).toMatch(/nome/);
    expect(validarPedido({ ...valido, contato: "" })).toMatch(/contato/);
    expect(validarPedido({ ...valido, chapaId: null })).toMatch(/chapa/);
    expect(validarPedido({ ...valido, medidaCorteCm: "0" })).toMatch(/medida/);
    expect(validarPedido({ ...valido, quantidadePecas: "" })).toMatch(/1 peça/);
  });
});

describe("fraseDoCorte", () => {
  test("monta a frase do exemplo do balcão (90 em 35,7)", () => {
    const frase = fraseDoCorte({ pecas: 2, sobra: 18.6 }, 90, 35.7);
    expect(frase).toContain("2 peça(s)");
    expect(frase).toContain("18.6 cm");
  });
  test("avisa quando o corte não cabe", () => {
    expect(fraseDoCorte({ pecas: 0, sobra: 90 }, 90, 120)).toContain("não cabe");
  });
});

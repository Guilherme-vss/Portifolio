/** Testes dos helpers do front do CorteCerto. Rode com: npm test */
import { describe, expect, test } from "vitest";
import {
  fraseDoCorte,
  progressoDoPedido,
  proximoStatus,
  statusInfo,
  validarItem,
  validarPedido,
} from "./api.js";

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

describe("validarItem", () => {
  const valido = { chapaId: 1, medidaCorteCm: "35.7", quantidadePecas: "4" };

  test("aceita item completo", () => {
    expect(validarItem(valido)).toBeNull();
  });
  test("aponta cada campo com problema", () => {
    expect(validarItem({ ...valido, chapaId: null })).toMatch(/chapa/);
    expect(validarItem({ ...valido, medidaCorteCm: "0" })).toMatch(/medida/);
    expect(validarItem({ ...valido, quantidadePecas: "" })).toMatch(/1 peça/);
  });
  test("recusa corte maior que a chapa escolhida", () => {
    expect(validarItem({ ...valido, medidaCorteCm: "120" }, 90)).toMatch(/maior que a chapa/);
    expect(validarItem(valido, 90)).toBeNull();
  });
});

describe("validarPedido", () => {
  const itens = [{ chapaId: 1, medidaCorteCm: 35.7, quantidadePecas: 4 }];

  test("aceita pedido com cliente e lista de itens", () => {
    expect(validarPedido({ nomeCliente: "Ana", contato: "(11) 9", itens })).toBeNull();
  });
  test("exige nome, contato e pelo menos um item", () => {
    expect(validarPedido({ nomeCliente: " ", contato: "x", itens })).toMatch(/nome/);
    expect(validarPedido({ nomeCliente: "Ana", contato: "", itens })).toMatch(/contato/);
    expect(validarPedido({ nomeCliente: "Ana", contato: "x", itens: [] })).toMatch(/pelo menos uma chapa/);
  });
});

describe("progressoDoPedido", () => {
  test("calcula o percentual de itens feitos", () => {
    const pedido = { itens: [{ feito: true }, { feito: true }, { feito: false }, { feito: false }] };
    expect(progressoDoPedido(pedido)).toBe(50);
  });
  test("pedido sem itens é 0%", () => {
    expect(progressoDoPedido({ itens: [] })).toBe(0);
    expect(progressoDoPedido(null)).toBe(0);
  });
  test("tudo feito é 100%", () => {
    expect(progressoDoPedido({ itens: [{ feito: true }] })).toBe(100);
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

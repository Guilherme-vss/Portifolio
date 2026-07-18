/** Testes do CRM da marcenaria. É dinheiro — cobre feliz, borda e erro. */
import { describe, expect, test } from "vitest";
import {
  conferirProducao,
  custoDoPedido,
  faturamentoPorMaterial,
  painelFinanceiro,
  produtividade,
  valorDoPedido,
} from "./crm.js";

const CHAPA_MDF = { id: 1, nome: "MDF Branco", material: "MDF", tamanhoCm: 275, precoPorChapa: 289 };
const CHAPA_HDF = { id: 2, nome: "HDF Cru", material: "HDF", tamanhoCm: 275, precoPorChapa: 95 };

function pedido(status, itens) {
  return { id: 1, status, itens };
}

describe("valorDoPedido", () => {
  test("soma chapas necessárias × preço", () => {
    // 5 peças de 90cm numa chapa de 275cm: cabem 3 por chapa → 2 chapas → 578
    const p = pedido("entregue", [{ chapa: CHAPA_MDF, medidaCorteCm: 90, quantidadePecas: 5 }]);
    expect(valorDoPedido(p)).toBe(578);
  });

  test("pedido vazio vale zero (borda)", () => {
    expect(valorDoPedido({ itens: [] })).toBe(0);
    expect(valorDoPedido(null)).toBe(0);
  });
});

describe("painelFinanceiro", () => {
  const pedidos = [
    pedido("entregue", [{ chapa: CHAPA_MDF, medidaCorteCm: 90, quantidadePecas: 3 }]), // 1 chapa = 289
    pedido("entregue", [{ chapa: CHAPA_HDF, medidaCorteCm: 90, quantidadePecas: 3 }]), // 1 chapa = 95
    pedido("em_producao", [{ chapa: CHAPA_MDF, medidaCorteCm: 90, quantidadePecas: 3 }]), // a receber
  ];

  test("só conta faturamento do que foi ENTREGUE", () => {
    const painel = painelFinanceiro(pedidos);
    expect(painel.faturamento).toBe(384); // 289 + 95
    expect(painel.pedidosEntregues).toBe(2);
  });

  test("o que está em produção vira 'a receber', não faturamento", () => {
    expect(painelFinanceiro(pedidos).aReceber).toBe(289);
  });

  test("lucro = faturamento − custo, com margem coerente", () => {
    const painel = painelFinanceiro(pedidos, 0.45);
    expect(painel.custoMaterial).toBeCloseTo(384 / 1.45, 1);
    expect(painel.lucro).toBeCloseTo(384 - 384 / 1.45, 1);
    expect(painel.margemReal).toBeGreaterThan(0);
  });

  test("sem pedidos entregues, tudo zero (borda)", () => {
    const painel = painelFinanceiro([]);
    expect(painel.faturamento).toBe(0);
    expect(painel.ticketMedio).toBe(0);
    expect(painel.margemReal).toBe(0);
  });
});

describe("faturamentoPorMaterial", () => {
  test("agrupa por material, do maior para o menor", () => {
    const pedidos = [
      pedido("entregue", [
        { chapa: CHAPA_MDF, medidaCorteCm: 90, quantidadePecas: 3 }, // 289
        { chapa: CHAPA_HDF, medidaCorteCm: 90, quantidadePecas: 3 }, // 95
      ]),
    ];
    const resultado = faturamentoPorMaterial(pedidos);
    expect(resultado[0]).toEqual({ material: "MDF", valor: 289 });
    expect(resultado[1]).toEqual({ material: "HDF", valor: 95 });
  });
});

describe("produtividade", () => {
  const funcionarios = [
    { id: 1, nome: "Zé Serra" },
    { id: 2, nome: "Maria Corte" },
  ];
  const registros = [
    { funcionarioId: 1, pecas: 10 },
    { funcionarioId: 1, pecas: 5 },
    { funcionarioId: 2, pecas: 8 },
  ];

  test("soma peças por funcionário e ordena", () => {
    const r = produtividade(funcionarios, registros);
    expect(r[0].nome).toBe("Zé Serra");
    expect(r[0].pecasCortadas).toBe(15);
    expect(r[0].itensFeitos).toBe(2);
    expect(r[1].pecasCortadas).toBe(8);
  });

  test("funcionário sem produção aparece com zero (não some)", () => {
    const r = produtividade([...funcionarios, { id: 3, nome: "Novato" }], registros);
    expect(r.find((f) => f.id === 3).pecasCortadas).toBe(0);
  });
});

describe("conferirProducao", () => {
  const p = pedido("em_producao", [
    { id: 10, chapa: CHAPA_MDF, quantidadePecas: 4 },
    { id: 11, chapa: CHAPA_HDF, quantidadePecas: 6 },
  ]);

  test("detecta exato, sobra e falta", () => {
    const r = conferirProducao(p, { 10: 4, 11: 8 });
    expect(r[0].situacao).toBe("exato");
    expect(r[1].situacao).toBe("sobrou");
    expect(r[1].diferenca).toBe(2);
  });

  test("item não cortado conta como faltou (borda)", () => {
    const r = conferirProducao(p, { 10: 2 });
    expect(r[0].situacao).toBe("faltou");
    expect(r[1].situacao).toBe("faltou"); // nem registrado
  });
});

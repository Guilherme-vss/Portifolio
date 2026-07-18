/** Testes da árvore de categorias e da montagem do termo de busca. */
import { describe, expect, test } from "vitest";
import { CATEGORIAS, iconeCategoria, termoDeBusca } from "./categorias.js";

describe("CATEGORIAS", () => {
  test("toda categoria tem id, ícone e filhos", () => {
    for (const c of CATEGORIAS) {
      expect(c.id).toBeTruthy();
      expect(c.icone).toBeTruthy();
      expect(c.filhos.length).toBeGreaterThan(0);
    }
  });

  test("carro > Honda > Civic existe na árvore (o exemplo do pedido)", () => {
    const carro = CATEGORIAS.find((c) => c.id === "carro");
    const honda = carro.filhos.find((f) => f.nome === "Honda");
    expect(honda.filhos).toContain("Civic");
  });
});

describe("termoDeBusca", () => {
  const carro = CATEGORIAS.find((c) => c.id === "carro");
  const imovel = CATEGORIAS.find((c) => c.id === "imovel");

  test("carro usa a folha direto (já é 'Marca Modelo')", () => {
    const honda = carro.filhos.find((f) => f.nome === "Honda");
    expect(termoDeBusca(carro, honda, "Civic")).toBe("Civic");
  });

  test("imóvel prefixa o tipo para não virar busca genérica", () => {
    const apto = imovel.filhos.find((f) => f.nome === "Apartamento");
    expect(termoDeBusca(imovel, apto, "2 dormitórios")).toBe("Apartamento 2 dormitórios");
  });

  test("sem folha, termo vazio (borda)", () => {
    expect(termoDeBusca(carro, {}, null)).toBe("");
  });
});

describe("iconeCategoria", () => {
  test("devolve o ícone certo e um padrão para desconhecido", () => {
    expect(iconeCategoria("carro")).toBe("🚗");
    expect(iconeCategoria("inexistente")).toBe("🛒");
  });
});

/**
 * crm.js — a matemática do CRM da marcenaria.
 *
 * Aqui mora a regra de negócio do DONO: faturamento, custo de material, lucro,
 * produtividade por funcionário. Tudo função pura (recebe dados, devolve número)
 * para ser testável sem tela e sem servidor — é dinheiro, não pode ter surpresa.
 *
 * Estas mesmas funções deveriam existir no back-end .NET; aqui elas rodam no
 * navegador para a versão publicada funcionar. A fonte da verdade é uma só regra.
 */

const arred = (n) => Math.round(n * 100) / 100;

/** Valor de um pedido: cada item consome N chapas × preço da chapa. */
export function valorDoPedido(pedido) {
  if (!pedido?.itens?.length) return 0;
  return arred(
    pedido.itens.reduce((total, item) => {
      const chapa = item.chapa;
      if (!chapa) return total;
      const porChapa = Math.max(1, Math.floor(chapa.tamanhoCm / item.medidaCorteCm));
      const chapasNecessarias = Math.ceil(item.quantidadePecas / porChapa);
      return total + chapasNecessarias * chapa.precoPorChapa;
    }, 0)
  );
}

/** Custo do material de um pedido (o que a marcenaria pagou nas chapas). */
export function custoDoPedido(pedido, margem = 0.45) {
  // A empresa vende com margem sobre o custo. custo = preço / (1 + margem).
  return arred(valorDoPedido(pedido) / (1 + margem));
}

/**
 * Painel financeiro do dono: consolida todos os pedidos.
 * Só conta como faturamento o que foi entregue — pedido "recebido" ainda não
 * é dinheiro no caixa, é promessa. Essa distinção é o que separa CRM de ilusão.
 */
export function painelFinanceiro(pedidos, margem = 0.45) {
  const entregues = pedidos.filter((p) => p.status === "entregue");
  const emAndamento = pedidos.filter((p) => ["recebido", "em_producao", "pronto"].includes(p.status));

  const faturamento = arred(entregues.reduce((s, p) => s + valorDoPedido(p), 0));
  const custoMaterial = arred(entregues.reduce((s, p) => s + custoDoPedido(p, margem), 0));
  const lucro = arred(faturamento - custoMaterial);
  const aReceber = arred(emAndamento.reduce((s, p) => s + valorDoPedido(p), 0));

  const ticketMedio = entregues.length ? arred(faturamento / entregues.length) : 0;
  const margemReal = faturamento > 0 ? Math.round((lucro / faturamento) * 100) : 0;

  return {
    faturamento,
    custoMaterial,
    lucro,
    margemReal,
    aReceber,
    pedidosEntregues: entregues.length,
    pedidosEmAndamento: emAndamento.length,
    ticketMedio,
  };
}

/** Faturamento por material — mostra ao dono onde está o dinheiro. */
export function faturamentoPorMaterial(pedidos) {
  const mapa = {};
  for (const pedido of pedidos.filter((p) => p.status === "entregue")) {
    for (const item of pedido.itens ?? []) {
      const material = item.chapa?.material ?? "outro";
      const chapa = item.chapa;
      if (!chapa) continue;
      const porChapa = Math.max(1, Math.floor(chapa.tamanhoCm / item.medidaCorteCm));
      const valor = Math.ceil(item.quantidadePecas / porChapa) * chapa.precoPorChapa;
      mapa[material] = arred((mapa[material] ?? 0) + valor);
    }
  }
  return Object.entries(mapa)
    .map(([material, valor]) => ({ material, valor }))
    .sort((a, b) => b.valor - a.valor);
}

/**
 * Produtividade por funcionário: quantas PEÇAS cada um cortou.
 * `producaoRegistros` é a lista de { funcionarioId, pecas } que a tela do
 * produtor grava a cada item concluído.
 */
export function produtividade(funcionarios, producaoRegistros) {
  return funcionarios
    .map((f) => {
      const meus = producaoRegistros.filter((r) => r.funcionarioId === f.id);
      const pecas = meus.reduce((s, r) => s + (r.pecas ?? 0), 0);
      return { ...f, pecasCortadas: pecas, itensFeitos: meus.length };
    })
    .sort((a, b) => b.pecasCortadas - a.pecasCortadas);
}

/**
 * Conferência de produção: o produtor cortou a quantidade certa?
 * O pedido pede X; a serra às vezes rende peça a mais (sobra deu para outra).
 * Registrar isso é honestidade com o estoque — a peça extra não some.
 */
export function conferirProducao(pedido, cortadoPorItem) {
  return (pedido.itens ?? []).map((item) => {
    const cortado = cortadoPorItem[item.id] ?? 0;
    const diferenca = cortado - item.quantidadePecas;
    return {
      itemId: item.id,
      chapa: item.chapa?.nome,
      pedido: item.quantidadePecas,
      cortado,
      diferenca,
      situacao:
        diferenca === 0 ? "exato" : diferenca > 0 ? "sobrou" : "faltou",
    };
  });
}

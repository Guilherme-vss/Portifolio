/**
 * api.js — chamadas à API .NET e helpers puros (testados com Vitest).
 */

/** Formata dinheiro brasileiro. */
export function real(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Rótulo e cor de cada status do pedido (fluxo da produção). */
export function statusInfo(status) {
  const mapa = {
    recebido: { rotulo: "📥 Recebido", cor: "#0284c7" },
    em_producao: { rotulo: "⚙️ Em produção", cor: "#d97706" },
    pronto: { rotulo: "📦 Pronto", cor: "#059669" },
    entregue: { rotulo: "✅ Entregue", cor: "#64748b" },
  };
  return mapa[status] ?? { rotulo: status, cor: "#64748b" };
}

/** Próximo passo natural do fluxo (para o botão de avanço rápido). */
export function proximoStatus(status) {
  const fluxo = ["recebido", "em_producao", "pronto", "entregue"];
  const indice = fluxo.indexOf(status);
  return indice >= 0 && indice < fluxo.length - 1 ? fluxo[indice + 1] : null;
}

/** Valida UM item da lista antes de entrar no carrinho. */
export function validarItem({ chapaId, medidaCorteCm, quantidadePecas }, tamanhoChapa) {
  if (!chapaId) return "Escolha uma chapa do catálogo";
  const medida = Number(medidaCorteCm);
  if (!medida || medida <= 0) return "Informe a medida do corte em cm";
  if (tamanhoChapa && medida > tamanhoChapa) {
    return `O corte (${medida} cm) é maior que a chapa (${tamanhoChapa} cm)`;
  }
  const quantidade = Number(quantidadePecas);
  if (!quantidade || quantidade <= 0) return "Peça pelo menos 1 peça";
  return null;
}

/** Valida o pedido completo (dados do cliente + lista de itens). */
export function validarPedido({ nomeCliente, contato, itens }) {
  if (!nomeCliente?.trim()) return "Informe seu nome";
  if (!contato?.trim()) return "Informe um contato (telefone ou email)";
  if (!itens || itens.length === 0) return "Adicione pelo menos uma chapa à lista";
  return null;
}

/** Percentual de itens já produzidos de um pedido (para a barra de progresso). */
export function progressoDoPedido(pedido) {
  const total = pedido?.itens?.length || 0;
  if (total === 0) return 0;
  const feitos = pedido.itens.filter((item) => item.feito).length;
  return Math.round((feitos / total) * 100);
}

/** Resume o resultado da calculadora numa frase de balcão. */
export function fraseDoCorte({ pecas, sobra }, tamanhoChapa, tamanhoCorte) {
  if (pecas === 0) {
    return `O corte de ${tamanhoCorte} cm não cabe na chapa de ${tamanhoChapa} cm.`;
  }
  return `Da chapa de ${tamanhoChapa} cm saem ${pecas} peça(s) de ${tamanhoCorte} cm ` +
         `e sobra ${sobra} cm para aproveitar em outro corte.`;
}

import { motorLocal, usarMotorLocal } from "./demo.js";

/** Chamada padrão à API. */
export async function api(caminho, { metodo = "GET", corpo = null } = {}) {
  // Sem servidor (ex.: GitHub Pages), o motor local assume — com a mesma
  // matemática do motor Python e os dados salvos no próprio navegador.
  if (usarMotorLocal()) {
    return motorLocal(caminho, metodo, corpo);
  }

  const resposta = await fetch("/api" + caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : null,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || dados.detail || "Erro inesperado — a API está no ar?");
  }
  return dados;
}

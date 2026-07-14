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

/** Valida o formulário de pedido do cliente antes de enviar. */
export function validarPedido({ nomeCliente, contato, chapaId, medidaCorteCm, quantidadePecas }) {
  if (!nomeCliente?.trim()) return "Informe seu nome";
  if (!contato?.trim()) return "Informe um contato (telefone ou email)";
  if (!chapaId) return "Escolha uma chapa do catálogo";
  const medida = Number(medidaCorteCm);
  if (!medida || medida <= 0) return "Informe a medida do corte em cm";
  const quantidade = Number(quantidadePecas);
  if (!quantidade || quantidade <= 0) return "Peça pelo menos 1 peça";
  return null;
}

/** Resume o resultado da calculadora numa frase de balcão. */
export function fraseDoCorte({ pecas, sobra }, tamanhoChapa, tamanhoCorte) {
  if (pecas === 0) {
    return `O corte de ${tamanhoCorte} cm não cabe na chapa de ${tamanhoChapa} cm.`;
  }
  return `Da chapa de ${tamanhoChapa} cm saem ${pecas} peça(s) de ${tamanhoCorte} cm ` +
         `e sobra ${sobra} cm para aproveitar em outro corte.`;
}

/** Chamada padrão à API. */
export async function api(caminho, { metodo = "GET", corpo = null } = {}) {
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

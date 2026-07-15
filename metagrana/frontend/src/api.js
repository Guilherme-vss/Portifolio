/**
 * api.js — chamadas ao backend e helpers puros (testados com Vitest).
 */

/** Formata um número como dinheiro brasileiro: 1234.5 → "R$ 1.234,50". */
export function real(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Mês atual no formato usado pela API (AAAA-MM). */
export function mesAtual(data = new Date()) {
  return data.toISOString().slice(0, 7);
}

/** Resume a variação de preço em uma frase amigável (ou null sem dados). */
export function fraseVariacao(variacao) {
  if (!variacao) return null;
  const valorAbsoluto = real(Math.abs(variacao.diferenca));
  const percentual = Math.abs(variacao.percentual);
  return variacao.caiu
    ? `📉 O preço CAIU ${valorAbsoluto} (${percentual}%) desde a última busca — boa hora de comprar!`
    : `📈 O preço subiu ${valorAbsoluto} (${percentual}%) desde a última busca.`;
}

/** Valida o formulário de nova meta antes de enviar. */
export function validarMeta({ titulo, valor_alvo }) {
  if (!titulo?.trim()) return "Diga o que você quer comprar";
  const valor = Number(valor_alvo);
  if (!valor || valor <= 0) return "Informe um valor alvo maior que zero";
  return null;
}

import { motorLocal, usarMotorLocal } from "./demo.js";

/** Chamada padrão à API do MetaGrana. */
export async function api(caminho, { metodo = "GET", corpo = null } = {}) {
  // Sem servidor (ex.: GitHub Pages), o motor local assume — os dados
  // ficam salvos no próprio navegador e tudo continua funcionando.
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
    const detalhe = Array.isArray(dados.detail) ? dados.detail[0]?.msg : dados.detail;
    throw new Error(detalhe || "Erro inesperado — tente de novo");
  }
  return dados;
}

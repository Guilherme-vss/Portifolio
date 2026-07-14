/**
 * demo.js — modo demonstração do MetaGrana (GitHub Pages, sem backend).
 * Responde as chamadas da API com dados fictícios mantidos em memória.
 */

export function estaEmDemo() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.search.includes("demo=1"))
  );
}

export function mostrarFaixaDemo() {
  if (!estaEmDemo() || document.getElementById("faixa-demo")) return;
  const faixa = document.createElement("div");
  faixa.id = "faixa-demo";
  faixa.textContent = "🧪 Demonstração com dados fictícios — o sistema completo (com Mercado Livre e IA) roda com Docker.";
  faixa.style.cssText =
    "position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#064e3b;color:#fff;" +
    "text-align:center;font:600 12px 'Segoe UI',sans-serif;padding:7px 12px;opacity:0.95";
  document.body.appendChild(faixa);
}

/* ---------- Dados fictícios ---------- */

let gastos = [
  { id: "g1", descricao: "Mercado da semana", categoria: "mercado", valor: 412.35 },
  { id: "g2", descricao: "Conta de luz", categoria: "contas", valor: 268.9 },
  { id: "g3", descricao: "Cinema com a família", categoria: "lazer", valor: 120.0 },
  { id: "g4", descricao: "Gasolina", categoria: "transporte", valor: 250.0 },
  { id: "g5", descricao: "Farmácia", categoria: "saude", valor: 89.5 },
];

let metas = [
  {
    id: "m1", titulo: "PlayStation 5", marca: "Sony", modelo: "Slim 1TB",
    valor_alvo: 3500, valor_guardado: 2100,
    melhor_oferta: { preco: 3399.9, data: "2026-07-13" },
  },
  {
    id: "m2", titulo: "Notebook", marca: "Dell", modelo: "Inspiron 15",
    valor_alvo: 4200, valor_guardado: 900,
    melhor_oferta: { preco: 3989.0, data: "2026-07-13" },
  },
];

const ofertasFicticias = [
  { titulo: "PlayStation 5 Slim 1TB Digital", preco: 3399.9, link: "https://mercadolivre.com.br", condicao: "novo" },
  { titulo: "PlayStation 5 Slim 1TB c/ 2 jogos", preco: 3549.0, link: "https://mercadolivre.com.br", condicao: "novo" },
  { titulo: "PlayStation 5 usado 6 meses", preco: 2890.0, link: "https://mercadolivre.com.br", condicao: "usado" },
];

function comProgresso(meta) {
  const percentual = Math.min(100, Math.round((meta.valor_guardado / meta.valor_alvo) * 1000) / 10);
  return { ...meta, progresso: { percentual, falta: Math.max(0, meta.valor_alvo - meta.valor_guardado), concluida: percentual >= 100 } };
}

/* ---------- Roteador ---------- */

export async function respostaDemo(caminho, metodo = "GET", corpo = null) {
  await new Promise((r) => setTimeout(r, 250));

  if (caminho.startsWith("/gastos/resumo")) {
    const porCategoria = {};
    for (const gasto of gastos) {
      porCategoria[gasto.categoria] = Math.round(((porCategoria[gasto.categoria] || 0) + gasto.valor) * 100) / 100;
    }
    return {
      mes: new Date().toISOString().slice(0, 7),
      total: Math.round(gastos.reduce((soma, g) => soma + g.valor, 0) * 100) / 100,
      por_categoria: porCategoria,
    };
  }
  if (caminho.startsWith("/gastos") && metodo === "GET") return [...gastos];
  if (caminho === "/gastos" && metodo === "POST") {
    const novo = { id: "g" + Date.now(), ...corpo };
    gastos.unshift(novo);
    return novo;
  }
  if (caminho.startsWith("/gastos/") && metodo === "DELETE") {
    gastos = gastos.filter((g) => g.id !== caminho.split("/")[2]);
    return { ok: true };
  }

  if (caminho === "/metas" && metodo === "GET") return metas.map(comProgresso);
  if (caminho === "/metas" && metodo === "POST") {
    metas.push({ id: "m" + Date.now(), valor_guardado: 0, ...corpo });
    return { ok: true };
  }
  const guardar = caminho.match(/^\/metas\/(.+)\/guardar$/);
  if (guardar) {
    const meta = metas.find((m) => m.id === guardar[1]);
    if (meta) meta.valor_guardado += corpo.valor;
    return { ok: true };
  }
  if (caminho.match(/^\/metas\/(.+)\/precos$/)) {
    return {
      ofertas: ofertasFicticias,
      variacao: { anterior: 3549.0, atual: 3399.9, diferenca: -149.1, percentual: -4.2, caiu: true },
      historico: [
        { data: "2026-07-11", preco: 3599.0 },
        { data: "2026-07-12", preco: 3549.0 },
        { data: "2026-07-13", preco: 3399.9 },
      ],
    };
  }
  if (caminho.startsWith("/metas/") && metodo === "DELETE") {
    metas = metas.filter((m) => m.id !== caminho.split("/")[2]);
    return { ok: true };
  }

  if (caminho.startsWith("/dicas")) {
    return {
      fonte: "regras",
      dicas: [
        "✅ Boa! Seus gastos estão abaixo de 50% da renda. É o cenário ideal para acelerar suas metas.",
        "🔎 Sua maior despesa do mês é com \"mercado\" — reveja se dá para reduzir aí primeiro.",
        "📉 O preço do PlayStation 5 caiu 4,2% desde ontem — boa hora de comprar!",
      ],
    };
  }

  return { ok: true };
}

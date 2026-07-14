/**
 * demo.js — modo demonstração do CorteCerto (GitHub Pages, sem backend).
 *
 * Diferencial desta demo: a matemática de corte roda DE VERDADE aqui no
 * navegador (mesma lógica do motor Python), então a calculadora e o plano
 * otimizado funcionam 100% mesmo sem servidor.
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
  faixa.textContent = "🧪 Demonstração — a calculadora de corte funciona de verdade! O sistema completo (.NET + Python + PostgreSQL) roda com Docker.";
  faixa.style.cssText =
    "position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#7c2d12;color:#fff;" +
    "text-align:center;font:600 12px 'Segoe UI',sans-serif;padding:7px 12px;opacity:0.95";
  document.body.appendChild(faixa);
}

/* ---------- A matemática (espelho do motor Python) ---------- */

function calcularCorte(tamanhoChapa, tamanhoCorte, kerf = 0) {
  if (tamanhoCorte > tamanhoChapa) {
    return { pecas: 0, sobra: arred(tamanhoChapa), aproveitamento: 0 };
  }
  const pecas = Math.floor((tamanhoChapa + kerf) / (tamanhoCorte + kerf));
  const usado = pecas * tamanhoCorte + Math.max(0, pecas - 1) * kerf;
  return {
    pecas,
    sobra: arred(tamanhoChapa - usado),
    aproveitamento: arred((pecas * tamanhoCorte / tamanhoChapa) * 100, 1),
  };
}

function quantasChapas(tamanhoChapa, tamanhoCorte, pecasNecessarias, kerf = 0) {
  const porChapa = calcularCorte(tamanhoChapa, tamanhoCorte, kerf);
  if (porChapa.pecas === 0) {
    return { chapas: 0, possivel: false, motivo: "O corte é maior que a chapa" };
  }
  const cheias = Math.floor(pecasNecessarias / porChapa.pecas);
  const restantes = pecasNecessarias % porChapa.pecas;
  const sobraUltima = restantes
    ? arred(tamanhoChapa - (restantes * tamanhoCorte + Math.max(0, restantes - 1) * kerf))
    : porChapa.sobra;
  return {
    chapas: cheias + (restantes ? 1 : 0),
    possivel: true,
    pecas_por_chapa: porChapa.pecas,
    sobra_ultima_chapa: sobraUltima,
  };
}

function planoDeCorte(tamanhoChapa, cortes, kerf = 0) {
  const naoCabem = cortes.filter((corte) => corte > tamanhoChapa);
  if (naoCabem.length > 0) {
    throw new Error(`Estes cortes não cabem numa chapa de ${tamanhoChapa}: ${naoCabem.join(", ")}`);
  }
  const chapas = [];
  for (const corte of [...cortes].sort((a, b) => b - a)) {
    const consumo = corte + kerf;
    let destino = chapas.find(
      (chapa) => chapa.restante >= corte && (chapa.restante >= consumo || chapa.cortes.length === 0)
    );
    if (!destino) {
      destino = { restante: tamanhoChapa, cortes: [] };
      chapas.push(destino);
    }
    destino.restante = arred(destino.restante - (destino.cortes.length === 0 ? corte : consumo));
    destino.cortes.push(corte);
  }
  const totalCortado = cortes.reduce((soma, corte) => soma + corte, 0);
  return {
    chapas_necessarias: chapas.length,
    plano: chapas.map((chapa, i) => ({ chapa: i + 1, cortes: chapa.cortes, sobra: chapa.restante })),
    sobra_total: arred(chapas.reduce((soma, chapa) => soma + chapa.restante, 0)),
    aproveitamento: arred((totalCortado / (tamanhoChapa * chapas.length)) * 100, 1),
  };
}

function arred(numero, casas = 2) {
  const fator = 10 ** casas;
  return Math.round(numero * fator) / fator;
}

/* ---------- Dados fictícios ---------- */

const chapas = [
  { id: 1, nome: "Chapa Alumínio Natural", corNome: "Natural", corHex: "#c0c5cc", espessuraMm: 1.2, tamanhoCm: 90, precoPorChapa: 185 },
  { id: 2, nome: "Chapa Alumínio Branco", corNome: "Branco", corHex: "#f5f5f2", espessuraMm: 1.4, tamanhoCm: 90, precoPorChapa: 210 },
  { id: 3, nome: "Chapa Alumínio Preto Fosco", corNome: "Preto", corHex: "#2b2b2e", espessuraMm: 2.0, tamanhoCm: 120, precoPorChapa: 340 },
  { id: 4, nome: "Chapa Alumínio Bronze", corNome: "Bronze", corHex: "#8c6a3f", espessuraMm: 1.2, tamanhoCm: 60, precoPorChapa: 150 },
  { id: 5, nome: "Chapa Alumínio Anodizado", corNome: "Fosco", corHex: "#9aa2ab", espessuraMm: 1.8, tamanhoCm: 120, precoPorChapa: 295 },
];

let pedidos = [
  {
    id: 1, nomeCliente: "Marcos Vidraçaria", contato: "(11) 98888-0001",
    chapa: chapas[0], medidaCorteCm: 35.7, quantidadePecas: 5, status: "em_producao",
  },
  {
    id: 2, nomeCliente: "Construtora Horizonte", contato: "(11) 97777-0002",
    chapa: chapas[2], medidaCorteCm: 55, quantidadePecas: 8, status: "recebido",
  },
];

let estoque = chapas.map((chapa, i) => ({ id: i + 1, chapaId: chapa.id, chapa, quantidade: 10 }));

/* ---------- Roteador ---------- */

export async function respostaDemo(caminho, metodo = "GET", corpo = null) {
  await new Promise((r) => setTimeout(r, 200));

  if (caminho === "/chapas") return [...chapas];

  if (caminho === "/pedidos" && metodo === "GET") return [...pedidos];
  if (caminho === "/pedidos" && metodo === "POST") {
    pedidos = [{
      id: Date.now(),
      nomeCliente: corpo.nomeCliente, contato: corpo.contato,
      chapa: chapas.find((chapa) => chapa.id === corpo.chapaId),
      medidaCorteCm: corpo.medidaCorteCm, quantidadePecas: corpo.quantidadePecas,
      status: "recebido",
    }, ...pedidos];
    return { id: Date.now(), mensagem: "Pedido recebido! A esquadria entrará em contato. 🤝 (demo)" };
  }
  const status = caminho.match(/^\/pedidos\/(\d+)\/status$/);
  if (status) {
    const pedido = pedidos.find((p) => p.id === Number(status[1]));
    if (pedido) pedido.status = corpo.status;
    return { ok: true };
  }

  if (caminho === "/estoque" && metodo === "GET") return [...estoque];
  if (caminho === "/estoque" && metodo === "POST") {
    const item = estoque.find((i) => i.chapaId === corpo.chapaId);
    if (item) item.quantidade = corpo.quantidade;
    return { ok: true };
  }

  // Cálculos: a mesma matemática do motor, rodando no navegador
  if (caminho === "/corte") {
    return calcularCorte(corpo.tamanhoChapa, corpo.tamanhoCorte, corpo.kerf || 0);
  }
  if (caminho === "/corte/chapas-necessarias") {
    return quantasChapas(corpo.tamanhoChapa, corpo.tamanhoCorte, corpo.pecasNecessarias, corpo.kerf || 0);
  }
  if (caminho === "/corte/plano") {
    try {
      return planoDeCorte(corpo.tamanhoChapa, corpo.cortes, corpo.kerf || 0);
    } catch (erro) {
      throw new Error(erro.message);
    }
  }

  return { ok: true };
}

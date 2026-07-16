/**
 * demo.js — motor LOCAL do CorteCerto.
 *
 * Quando o site roda sem o servidor (ex.: hospedado no GitHub Pages),
 * este módulo assume o papel da API: os dados ficam salvos no navegador
 * (localStorage) e TODA a matemática de corte roda aqui, idêntica ao
 * motor Python. Ou seja: o sistema é 100% funcional mesmo sem backend.
 */

export function usarMotorLocal() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.protocol === "file:" ||
      window.location.search.includes("local=1"))
  );
}

/* ---------- Persistência no navegador ---------- */

function carregar(chave, padrao) {
  try {
    const bruto = localStorage.getItem("cc2-" + chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem("cc2-" + chave, JSON.stringify(valor));
  } catch {
    /* modo anônimo sem espaço: segue só em memória */
  }
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

/* ---------- Catálogo (madeira: MDF, HDF e compensado) ---------- */

const catalogo = [
  { id: 1, nome: "MDF Branco TX", material: "MDF", corNome: "Branco", corHex: "#f7f5f0", espessuraMm: 15, tamanhoCm: 275, precoPorChapa: 289 },
  { id: 2, nome: "MDF Branco Ultra", material: "MDF", corNome: "Branco", corHex: "#fbfaf6", espessuraMm: 18, tamanhoCm: 275, precoPorChapa: 329 },
  { id: 3, nome: "MDF Carvalho Mel", material: "MDF", corNome: "Carvalho", corHex: "#b98a4e", espessuraMm: 18, tamanhoCm: 275, precoPorChapa: 365 },
  { id: 4, nome: "MDF Nogueira", material: "MDF", corNome: "Nogueira", corHex: "#6b4a2b", espessuraMm: 15, tamanhoCm: 275, precoPorChapa: 349 },
  { id: 5, nome: "MDF Preto Fosco", material: "MDF", corNome: "Preto", corHex: "#26262a", espessuraMm: 18, tamanhoCm: 275, precoPorChapa: 398 },
  { id: 6, nome: "MDF Cinza Cristal", material: "MDF", corNome: "Cinza", corHex: "#b9bcc0", espessuraMm: 6, tamanhoCm: 185, precoPorChapa: 189 },
  { id: 7, nome: "HDF Cru 3mm", material: "HDF", corNome: "Cru", corHex: "#caa06a", espessuraMm: 3, tamanhoCm: 275, precoPorChapa: 95 },
  { id: 8, nome: "HDF Branco 3mm", material: "HDF", corNome: "Branco", corHex: "#f2efe8", espessuraMm: 3, tamanhoCm: 275, precoPorChapa: 119 },
  { id: 9, nome: "Compensado Naval", material: "Compensado", corNome: "Natural", corHex: "#c8965a", espessuraMm: 10, tamanhoCm: 220, precoPorChapa: 259 },
];

const pedidoExemplo = {
  id: 1,
  codigo: "MF-DEMO1",
  nomeCliente: "Marcos Marcenaria",
  contato: "(11) 98888-0001",
  observacao: "Entrega combinada para sexta",
  status: "em_producao",
  criadoEm: new Date().toISOString(),
  itens: [
    { id: 1, chapa: catalogo[2], medidaCorteCm: 35.7, quantidadePecas: 5, feito: true },
    { id: 2, chapa: catalogo[0], medidaCorteCm: 120, quantidadePecas: 2, feito: false },
    { id: 3, chapa: catalogo[6], medidaCorteCm: 90, quantidadePecas: 6, feito: false },
  ],
};

let pedidos = carregar("pedidos", [pedidoExemplo]);
let estoque = carregar("estoque", catalogo.map((chapa, i) => ({ id: i + 1, chapaId: chapa.id, chapa, quantidade: 10 })));

function gerarCodigo() {
  const letras = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let sufixo = "";
  for (let i = 0; i < 5; i++) sufixo += letras[Math.floor(Math.random() * letras.length)];
  return "MF-" + sufixo;
}

/* ---------- Roteador ---------- */

export async function motorLocal(caminho, metodo = "GET", corpo = null) {
  await new Promise((r) => setTimeout(r, 150));

  if (caminho === "/chapas") return [...catalogo];

  if (caminho === "/pedidos" && metodo === "GET") return [...pedidos];

  if (caminho === "/pedidos" && metodo === "POST") {
    const codigo = gerarCodigo();
    const novo = {
      id: Date.now(),
      codigo,
      nomeCliente: corpo.nomeCliente,
      contato: corpo.contato,
      observacao: corpo.observacao || "",
      status: "recebido",
      criadoEm: new Date().toISOString(),
      itens: corpo.itens.map((item, i) => ({
        id: Date.now() + i,
        chapa: catalogo.find((chapa) => chapa.id === item.chapaId),
        medidaCorteCm: item.medidaCorteCm,
        quantidadePecas: item.quantidadePecas,
        feito: false,
      })),
    };
    pedidos = [novo, ...pedidos];
    salvar("pedidos", pedidos);
    return { id: novo.id, codigo, mensagem: `Pedido recebido! Guarde o código ${codigo} para acompanhar o andamento. 🤝` };
  }

  const acompanhar = caminho.match(/^\/pedidos\/acompanhar\/(.+)$/);
  if (acompanhar) {
    const pedido = pedidos.find((p) => p.codigo === decodeURIComponent(acompanhar[1]).trim().toUpperCase());
    if (!pedido) throw new Error("Código não encontrado — confira com a esquadria");
    return pedido;
  }

  const status = caminho.match(/^\/pedidos\/(\d+)\/status$/);
  if (status) {
    const pedido = pedidos.find((p) => p.id === Number(status[1]));
    if (pedido) pedido.status = corpo.status;
    salvar("pedidos", pedidos);
    return { ok: true };
  }

  const feito = caminho.match(/^\/pedidos\/(\d+)\/itens\/(\d+)\/feito$/);
  if (feito) {
    const pedido = pedidos.find((p) => p.id === Number(feito[1]));
    const item = pedido?.itens.find((i) => i.id === Number(feito[2]));
    if (item) item.feito = corpo.feito;
    salvar("pedidos", pedidos);
    return { ok: true };
  }

  if (caminho === "/estoque" && metodo === "GET") return [...estoque];
  if (caminho === "/estoque" && metodo === "POST") {
    const item = estoque.find((i) => i.chapaId === corpo.chapaId);
    if (item) item.quantidade = corpo.quantidade;
    salvar("estoque", estoque);
    return { ok: true };
  }

  if (caminho === "/corte") {
    return calcularCorte(corpo.tamanhoChapa, corpo.tamanhoCorte, corpo.kerf || 0);
  }
  if (caminho === "/corte/chapas-necessarias") {
    return quantasChapas(corpo.tamanhoChapa, corpo.tamanhoCorte, corpo.pecasNecessarias, corpo.kerf || 0);
  }
  if (caminho === "/corte/plano") {
    return planoDeCorte(corpo.tamanhoChapa, corpo.cortes, corpo.kerf || 0);
  }

  return { ok: true };
}

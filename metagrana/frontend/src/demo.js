/**
 * demo.js — motor LOCAL do MetaGrana.
 *
 * Quando o site roda sem o servidor (ex.: hospedado no GitHub Pages),
 * este módulo assume o papel da API: gastos e metas ficam salvos no
 * navegador (localStorage), então o sistema é 100% funcional — o que
 * você registrar hoje continua aqui amanhã.
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
    const bruto = localStorage.getItem("mg-" + chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem("mg-" + chave, JSON.stringify(valor));
  } catch {
    /* sem espaço: segue em memória */
  }
}

/* ---------- Dados iniciais (primeira visita) ---------- */

const hoje = new Date().toISOString().slice(0, 10);

let gastos = carregar("gastos", [
  { id: "g1", descricao: "Mercado da semana", categoria: "mercado", valor: 412.35, data: hoje },
  { id: "g2", descricao: "Conta de luz", categoria: "contas", valor: 268.9, data: hoje },
  { id: "g3", descricao: "Cinema com a família", categoria: "lazer", valor: 120.0, data: hoje },
  { id: "g4", descricao: "Gasolina", categoria: "transporte", valor: 250.0, data: hoje },
]);

let metas = carregar("metas", [
  {
    id: "m1", titulo: "PlayStation 5", marca: "Sony", modelo: "Slim 1TB",
    valor_alvo: 3500, valor_guardado: 2100,
    melhor_oferta: { preco: 3399.9, data: hoje },
  },
  {
    id: "m2", titulo: "Notebook", marca: "Dell", modelo: "Inspiron 15",
    valor_alvo: 4200, valor_guardado: 900,
    melhor_oferta: { preco: 3989.0, data: hoje },
  },
]);

const ofertasFicticias = [
  { titulo: "PlayStation 5 Slim 1TB Digital", preco: 3399.9, link: "https://lista.mercadolivre.com.br/playstation-5", condicao: "novo" },
  { titulo: "PlayStation 5 Slim 1TB c/ 2 jogos", preco: 3549.0, link: "https://lista.mercadolivre.com.br/playstation-5", condicao: "novo" },
  { titulo: "PlayStation 5 usado 6 meses", preco: 2890.0, link: "https://lista.mercadolivre.com.br/playstation-5", condicao: "usado" },
];

// Vitrine local: busca real no Mercado Livre direto do navegador quando
// possível; se o CORS bloquear, mostra a vitrine fixa abaixo.
const promocoesFixas = [
  { titulo: "Smart TV 55\" 4K", preco: 2299.0, preco_original: 2899.0, desconto: 21, link: "https://lista.mercadolivre.com.br/smart-tv-55" },
  { titulo: "Air Fryer 12L forno", preco: 479.9, preco_original: 699.9, desconto: 31, link: "https://lista.mercadolivre.com.br/air-fryer" },
  { titulo: "Notebook i5 16GB SSD 512", preco: 2599.0, preco_original: 3299.0, desconto: 21, link: "https://lista.mercadolivre.com.br/notebook-i5" },
  { titulo: "Celular 256GB 5G", preco: 1799.0, preco_original: 2399.0, desconto: 25, link: "https://lista.mercadolivre.com.br/celular-5g" },
  { titulo: "Console + 2 controles", preco: 3199.0, preco_original: 3999.0, desconto: 20, link: "https://lista.mercadolivre.com.br/playstation-5" },
  { titulo: "Fone Bluetooth ANC", preco: 249.9, preco_original: 399.9, desconto: 38, link: "https://lista.mercadolivre.com.br/fone-bluetooth" },
];

async function promocoesAoVivo() {
  const termos = ["smart tv", "notebook", "air fryer"];
  const achadas = [];
  for (const termo of termos) {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=8`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("sem acesso");
    const dados = await resposta.json();
    for (const item of dados.results || []) {
      if (item.original_price && item.price && item.original_price > item.price) {
        achadas.push({
          titulo: item.title,
          preco: item.price,
          preco_original: item.original_price,
          desconto: Math.round((1 - item.price / item.original_price) * 100),
          link: item.permalink,
        });
      }
    }
  }
  return achadas.sort((a, b) => b.desconto - a.desconto).slice(0, 12);
}

// Links de busca profunda (espelha o LOJAS do fontes.py).
const LOJAS = {
  Amazon: (t) => `https://www.amazon.com.br/s?k=${t}&s=price-asc-rank`,
  Magalu: (t) => `https://www.magazineluiza.com.br/busca/${t}/?ordenacao=menor-preco`,
  Americanas: (t) => `https://www.americanas.com.br/busca/${t}?sortBy=lowerPrice`,
  "Casas Bahia": (t) => `https://www.casasbahia.com.br/${t}/b?ordenacao=menorPreco`,
  OLX: (t) => `https://www.olx.com.br/brasil?q=${t}&sf=1`,
};
const PORTAIS_IMOVEL = {
  "OLX Imóveis": (t) => `https://www.olx.com.br/imoveis?q=${t}`,
  VivaReal: (t) => `https://www.vivareal.com.br/venda/?q=${t}`,
  "ZAP Imóveis": (t) => `https://www.zapimoveis.com.br/venda/?q=${t}`,
};

async function buscarMultifonte(termo, categoria) {
  const termoUrl = encodeURIComponent(termo).replace(/%20/g, "+");
  let comPreco = [];
  let aviso = null;

  // Preço real do Mercado Livre (o navegador consegue chamar a API pública).
  try {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=6&sort=price_asc`;
    const r = await fetch(url);
    if (r.ok) {
      const dados = await r.json();
      comPreco = (dados.results || [])
        .filter((i) => i.price != null)
        .map((i) => ({
          titulo: i.title,
          preco: i.price,
          fonte: "Mercado Livre",
          link: i.permalink,
          condicao: i.condition === "new" ? "novo" : "usado",
          tipo: "produto",
        }))
        .sort((a, b) => a.preco - b.preco);
    }
  } catch {
    aviso = "O Mercado Livre não respondeu agora — veja as outras lojas abaixo.";
  }

  const lojas = categoria === "imovel" ? PORTAIS_IMOVEL : LOJAS;
  const outrasLojas = Object.entries(lojas).map(([fonte, montar]) => ({
    titulo: `Ver ofertas de "${termo}" na ${fonte}`,
    preco: null,
    fonte,
    link: montar(termoUrl),
    tipo: "busca",
  }));

  return {
    termo,
    com_preco: comPreco,
    outras_lojas: outrasLojas,
    menor_preco: comPreco[0] || null,
    aviso,
  };
}

/* ---------- Roteador ---------- */

export async function motorLocal(caminho, metodo = "GET", corpo = null) {
  await new Promise((r) => setTimeout(r, 150));

  if (caminho.startsWith("/gastos/resumo")) {
    const porCategoria = {};
    for (const gasto of gastos) {
      porCategoria[gasto.categoria] =
        Math.round(((porCategoria[gasto.categoria] || 0) + gasto.valor) * 100) / 100;
    }
    return {
      mes: new Date().toISOString().slice(0, 7),
      total: Math.round(gastos.reduce((soma, g) => soma + g.valor, 0) * 100) / 100,
      por_categoria: porCategoria,
    };
  }
  if (caminho.startsWith("/gastos") && metodo === "GET") return [...gastos];
  if (caminho === "/gastos" && metodo === "POST") {
    const novo = { id: "g" + Date.now(), data: hoje, ...corpo };
    gastos = [novo, ...gastos];
    salvar("gastos", gastos);
    return novo;
  }
  if (caminho.startsWith("/gastos/") && metodo === "DELETE") {
    gastos = gastos.filter((g) => g.id !== caminho.split("/")[2]);
    salvar("gastos", gastos);
    return { ok: true };
  }

  if (caminho === "/metas" && metodo === "GET") {
    return metas.map((meta) => {
      const percentual = Math.min(100, Math.round((meta.valor_guardado / meta.valor_alvo) * 1000) / 10);
      return {
        ...meta,
        progresso: {
          percentual,
          falta: Math.max(0, meta.valor_alvo - meta.valor_guardado),
          concluida: percentual >= 100,
        },
      };
    });
  }
  if (caminho === "/metas" && metodo === "POST") {
    metas = [...metas, { id: "m" + Date.now(), valor_guardado: 0, ...corpo }];
    salvar("metas", metas);
    return { ok: true };
  }
  const guardar = caminho.match(/^\/metas\/(.+)\/guardar$/);
  if (guardar) {
    const meta = metas.find((m) => m.id === guardar[1]);
    if (meta) meta.valor_guardado += corpo.valor;
    salvar("metas", metas);
    return { ok: true };
  }
  if (caminho.match(/^\/metas\/(.+)\/precos$/)) {
    return {
      ofertas: ofertasFicticias,
      variacao: { anterior: 3549.0, atual: 3399.9, diferenca: -149.1, percentual: -4.2, caiu: true },
      historico: [],
    };
  }
  if (caminho.startsWith("/metas/") && metodo === "DELETE") {
    metas = metas.filter((m) => m.id !== caminho.split("/")[2]);
    salvar("metas", metas);
    return { ok: true };
  }

  if (caminho === "/promocoes") {
    try {
      const aoVivo = await promocoesAoVivo();
      if (aoVivo.length > 0) return aoVivo;
    } catch {
      /* CORS ou rede: usa a vitrine fixa */
    }
    return promocoesFixas;
  }

  /* ----- busca multi-fonte (mesma lógica do fontes.py) ----- */
  if (caminho.startsWith("/buscar")) {
    const params = new URLSearchParams(caminho.split("?")[1] || "");
    const termo = params.get("termo") || "";
    const categoria = params.get("categoria");
    return buscarMultifonte(termo, categoria);
  }

  if (caminho.startsWith("/dicas")) {
    // Robô de dicas: busca as cotações AO VIVO na AwesomeAPI (aceita CORS)
    let cotacoes = [];
    const dicasMercado = [];
    try {
      const resposta = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL");
      const dados = await resposta.json();
      const nomes = { USDBRL: ["💵 Dólar", "dolar"], EURBRL: ["💶 Euro", "euro"], BTCBRL: ["₿ Bitcoin", "bitcoin"] };
      for (const [chave, [nome, codigo]] of Object.entries(nomes)) {
        if (!dados[chave]) continue;
        cotacoes.push({
          codigo,
          nome,
          valor: Math.round(parseFloat(dados[chave].bid) * 100) / 100,
          variacao_pct: Math.round(parseFloat(dados[chave].pctChange || 0) * 100) / 100,
        });
      }
      const dolar = cotacoes.find((c) => c.codigo === "dolar");
      if (dolar) {
        dicasMercado.push(
          dolar.variacao_pct > 0.5
            ? `💵 O dólar subiu ${dolar.variacao_pct}% hoje (R$ ${dolar.valor.toFixed(2)}). Importados tendem a encarecer — fique de olho na vitrine de promoções.`
            : dolar.variacao_pct < -0.5
              ? `💵 O dólar caiu ${Math.abs(dolar.variacao_pct)}% hoje (R$ ${dolar.valor.toFixed(2)}). Boa janela para metas de eletrônicos e importados.`
              : `💵 Dólar estável hoje em R$ ${dolar.valor.toFixed(2)} — sem pressa nem pânico para importados.`
        );
      }
      const btc = cotacoes.find((c) => c.codigo === "bitcoin");
      if (btc && Math.abs(btc.variacao_pct) > 2) {
        dicasMercado.push(
          `₿ O bitcoin ${btc.variacao_pct > 0 ? "subiu" : "caiu"} ${Math.abs(btc.variacao_pct)}% nas últimas 24h — reserva de emergência vem antes de investimento volátil.`
        );
      }
    } catch {
      /* API fora do ar: seguimos só com a análise dos gastos */
    }

    const total = gastos.reduce((soma, g) => soma + g.valor, 0);
    const maior = Object.entries(
      gastos.reduce((mapa, g) => ({ ...mapa, [g.categoria]: (mapa[g.categoria] || 0) + g.valor }), {})
    ).sort((a, b) => b[1] - a[1])[0];

    return {
      fonte: "mercado+regras",
      cotacoes,
      dicas: [
        ...dicasMercado,
        `📒 Você registrou R$ ${total.toFixed(2).replace(".", ",")} em gastos neste mês — quem mede, controla.`,
        maior
          ? `🔎 Sua maior despesa é com "${maior[0]}" (R$ ${maior[1].toFixed(2).replace(".", ",")}). Reveja se dá para reduzir aí primeiro.`
          : "🎯 Registre seus gastos para receber dicas personalizadas.",
      ],
    };
  }

  return { ok: true };
}

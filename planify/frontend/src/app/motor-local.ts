/**
 * motor-local.ts — o Planify rodando 100% no navegador.
 *
 * Quando o site é publicado sem o backend Java (ex.: GitHub Pages), este
 * módulo assume: lê o arquivo enviado DE VERDADE, aplica todas as operações
 * de organização, faz o profiling das colunas e monta o resumo financeiro —
 * a mesma lógica do domínio Java, espelhada em TypeScript. Nada de "demo":
 * você envia sua planilha e recebe sua planilha organizada.
 */
import type { Opcoes, PerfilColuna, RespostaOrganizacao, ResumoFinanceiro } from "./planilha.service";

export function usarMotorLocal(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.protocol === "file:" ||
      window.location.search.includes("local=1"))
  );
}

/* ---------- Leitura ---------- */

export function lerCsv(texto: string): string[][] {
  return texto
    .split(/\r?\n/)
    .filter((linha, i, todas) => linha.length > 0 || i < todas.length - 1)
    .map((linha) => {
      const separador = linha.includes(";") ? ";" : ",";
      return linha.split(separador).map((celula) => celula.trim());
    });
}

/* ---------- Números / datas (formato brasileiro) ---------- */

export function numeroOuNulo(texto: string): number | null {
  if (!texto || !texto.trim()) return null;
  const limpo = texto.replace("R$", "").trim();
  // 1.234,56 -> 1234.56
  const brasileiro = limpo.replace(/\./g, "").replace(",", ".");
  const n = Number(brasileiro);
  if (!Number.isNaN(n) && /\d/.test(brasileiro)) return n;
  const direto = Number(limpo);
  return !Number.isNaN(direto) && /\d/.test(limpo) ? direto : null;
}

function tirarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalizarData(texto: string): string {
  const t = texto.trim();
  // já ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/);
  if (!m) return texto;
  let [, dia, mes, ano] = m;
  if (ano.length === 2) ano = "20" + ano;
  const d = Number(dia), me = Number(mes);
  if (d < 1 || d > 31 || me < 1 || me > 12) return texto;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function paraTitulo(texto: string): string {
  if (!texto || numeroOuNulo(texto) !== null) return texto;
  return texto
    .toLowerCase()
    .replace(/(^|[\s-])([a-zà-ú])/g, (_, sep, letra) => sep + letra.toUpperCase());
}

/* ---------- Transformações (só linhas de dados; cabeçalho intacto) ---------- */

const arred = (n: number) => Math.round(n * 100) / 100;

function mapearDados(linhas: string[][], fn: (c: string) => string): string[][] {
  if (linhas.length <= 1) return linhas;
  return [linhas[0], ...linhas.slice(1).map((linha) => linha.map(fn))];
}

function mapearColuna(linhas: string[][], coluna: number, fn: (c: string) => string): string[][] {
  if (linhas.length <= 1 || coluna < 0) return linhas;
  return [
    linhas[0],
    ...linhas.slice(1).map((linha) => {
      const nova = [...linha];
      if (coluna < nova.length && nova[coluna]?.trim()) nova[coluna] = fn(nova[coluna]);
      return nova;
    }),
  ];
}

/* ---------- Profiling ---------- */

function pareceData(texto: string): boolean {
  return /^\d{1,4}[/\-]\d{1,2}[/\-]\d{1,4}$/.test(texto.trim());
}

export function perfilar(linhas: string[][]): PerfilColuna[] {
  if (linhas.length === 0) return [];
  const cabecalho = linhas[0];
  return cabecalho.map((nome, coluna) => {
    const valores = linhas.slice(1).map((l) => l[coluna] ?? "");
    let vazias = 0, monetarias = 0, datas = 0;
    const numeros: number[] = [];
    const distintos = new Set<string>();
    for (const v of valores) {
      if (!v || !v.trim()) { vazias++; continue; }
      distintos.add(v.trim().toLowerCase());
      if (v.includes("R$")) monetarias++;
      const n = numeroOuNulo(v);
      if (n !== null) numeros.push(n);
      else if (pareceData(v)) datas++;
    }
    const preenchidas = valores.length - vazias;
    const metade = preenchidas / 2;
    let tipo: PerfilColuna["tipo"] = "TEXTO";
    if (preenchidas === 0) tipo = "VAZIA";
    else if (monetarias > metade) tipo = "MOEDA";
    else if (numeros.length > metade) tipo = "NUMERO";
    else if (datas > metade) tipo = "DATA";

    const soma = numeros.length ? arred(numeros.reduce((a, b) => a + b, 0)) : null;
    return {
      nome,
      tipo,
      total: valores.length,
      preenchidas,
      vazias,
      distintos: distintos.size,
      minimo: numeros.length ? Math.min(...numeros) : null,
      maximo: numeros.length ? Math.max(...numeros) : null,
      media: soma !== null ? arred(soma / numeros.length) : null,
      soma,
      percentualPreenchido: valores.length ? Math.round((preenchidas / valores.length) * 100) : 0,
    };
  });
}

export function resumoFinanceiro(
  linhas: string[][],
  colunaCategoria: number,
  colunaValor: number
): ResumoFinanceiro | null {
  if (linhas.length <= 1 || colunaCategoria < 0 || colunaValor < 0) return null;
  const acumulado = new Map<string, { soma: number; itens: number }>();
  let total = 0;
  for (const linha of linhas.slice(1)) {
    let categoria = (linha[colunaCategoria] ?? "").trim() || "(sem categoria)";
    const valor = numeroOuNulo(linha[colunaValor] ?? "");
    if (valor === null) continue;
    const atual = acumulado.get(categoria) ?? { soma: 0, itens: 0 };
    atual.soma += valor;
    atual.itens += 1;
    acumulado.set(categoria, atual);
    total += valor;
  }
  const grupos = [...acumulado.entries()]
    .map(([categoria, { soma, itens }]) => ({
      categoria,
      soma: arred(soma),
      itens,
      percentual: total === 0 ? 0 : arred((soma / total) * 100),
    }))
    .sort((a, b) => b.soma - a.soma);
  return {
    colunaCategoria: linhas[0][colunaCategoria] ?? "",
    colunaValor: linhas[0][colunaValor] ?? "",
    grupos,
    total: arred(total),
  };
}

/* ---------- ViaCEP (aceita CORS: funciona no navegador) ---------- */

async function enriquecerComCep(linhas: string[][], colunaCep: number): Promise<string[][]> {
  if (linhas.length <= 1) return linhas;
  const cabecalho = [...linhas[0], "Cidade (ViaCEP)", "UF (ViaCEP)"];
  const cache = new Map<string, { cidade: string; uf: string } | null>();
  const resultado: string[][] = [cabecalho];

  for (const linha of linhas.slice(1)) {
    const nova = [...linha];
    let cidade = "", uf = "";
    const digitos = (nova[colunaCep] ?? "").replace(/\D/g, "");
    if (digitos.length === 8) {
      nova[colunaCep] = digitos.slice(0, 5) + "-" + digitos.slice(5);
      if (!cache.has(digitos)) {
        try {
          const r = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
          const dados = await r.json();
          cache.set(digitos, dados.erro ? null : { cidade: dados.localidade, uf: dados.uf });
        } catch {
          cache.set(digitos, null);
        }
      }
      const endereco = cache.get(digitos);
      if (endereco) { cidade = endereco.cidade; uf = endereco.uf; }
    }
    resultado.push([...nova, cidade, uf]);
  }
  return resultado;
}

/* ---------- Orquestração ---------- */

export async function organizarLocal(arquivo: File, opcoes: Opcoes): Promise<RespostaOrganizacao> {
  const texto = await arquivo.text();
  let linhas = lerCsv(texto);
  const linhasAntes = linhas.length;
  let vaziasRemovidas = 0, duplicadasRemovidas = 0;

  if (opcoes.limparEspacos) {
    linhas = mapearDados(linhas, (c) => c.trim().replace(/\s+/g, " "));
  }
  if (opcoes.removerVazias) {
    const antes = linhas.length;
    linhas = linhas.filter((linha) => linha.some((c) => c.trim()));
    vaziasRemovidas = antes - linhas.length;
  }
  if (opcoes.removerDuplicadas) {
    const vistas = new Set<string>();
    const antes = linhas.length;
    linhas = linhas.filter((linha) => {
      const chave = linha.join("").toLowerCase();
      if (vistas.has(chave)) return false;
      vistas.add(chave);
      return true;
    });
    duplicadasRemovidas = antes - linhas.length;
  }
  if (opcoes.removerColunasVazias && linhas.length > 1) {
    const totalCol = Math.max(...linhas.map((l) => l.length));
    const uteis: number[] = [];
    for (let c = 0; c < totalCol; c++) {
      if (linhas.slice(1).some((l) => (l[c] ?? "").trim())) uteis.push(c);
    }
    linhas = linhas.map((l) => uteis.map((c) => l[c] ?? ""));
  }
  if (opcoes.removerAcentos) linhas = mapearDados(linhas, tirarAcentos);
  if (opcoes.textoEmTitulo) linhas = mapearDados(linhas, paraTitulo);
  if (opcoes.preencherVazios && opcoes.preencherVaziosCom) {
    linhas = mapearDados(linhas, (c) => (c.trim() ? c : opcoes.preencherVaziosCom));
  }
  if (opcoes.normalizarMoeda && opcoes.colunaMoeda >= 0) {
    linhas = mapearColuna(linhas, opcoes.colunaMoeda, (c) => {
      const n = numeroOuNulo(c);
      return n === null ? c : n.toFixed(2);
    });
  }
  if (opcoes.normalizarData && opcoes.colunaData >= 0) {
    linhas = mapearColuna(linhas, opcoes.colunaData, normalizarData);
  }
  if (opcoes.maiuscula && opcoes.colunaMaiuscula >= 0) {
    linhas = mapearColuna(linhas, opcoes.colunaMaiuscula, (c) => c.toUpperCase());
  }
  if (opcoes.minuscula && opcoes.colunaMinuscula >= 0) {
    linhas = mapearColuna(linhas, opcoes.colunaMinuscula, (c) => c.toLowerCase());
  }
  if (opcoes.ordenar && opcoes.colunaOrdenacao >= 0 && linhas.length > 1) {
    const corpo = [...linhas.slice(1)];
    corpo.sort((a, b) => {
      const va = a[opcoes.colunaOrdenacao] ?? "", vb = b[opcoes.colunaOrdenacao] ?? "";
      const na = numeroOuNulo(va), nb = numeroOuNulo(vb);
      if (na !== null && nb !== null) return na - nb;
      return va.localeCompare(vb, "pt-BR", { sensitivity: "base" });
    });
    if (!opcoes.ordemCrescente) corpo.reverse();
    linhas = [linhas[0], ...corpo];
  }
  if (opcoes.normalizarCep && opcoes.colunaCep >= 0) {
    linhas = await enriquecerComCep(linhas, opcoes.colunaCep);
  }

  const resumo =
    opcoes.resumoFinanceiro && opcoes.colunaCategoria >= 0 && opcoes.colunaValor >= 0
      ? resumoFinanceiro(linhas, opcoes.colunaCategoria, opcoes.colunaValor)
      : null;

  return {
    linhas,
    csv: linhas.map((l) => l.join(";")).join("\n") + "\n",
    metricas: {
      linhasAntes,
      linhasDepois: linhas.length,
      vaziasRemovidas,
      duplicadasRemovidas,
      idProcessamento: Date.now(),
    },
    perfil: perfilar(linhas),
    resumoFinanceiro: resumo,
  };
}

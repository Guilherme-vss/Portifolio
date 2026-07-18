/**
 * tipos-arquivo.ts — o catálogo de "o que dá para organizar".
 *
 * O pedido do Guilherme: a pessoa vê a LOGO do que ela trabalha (Excel, Word,
 * fotos, arquivos por data...), clica, e vê as opções daquele tipo. Cada
 * profissão mexe com um tipo de arquivo — o hub fala a língua de cada uma.
 *
 * `motor` diz qual ferramenta abre aquele tipo:
 *   - "planilha": o organizador de dados completo (CSV/XLSX) que já existe.
 *   - "cliente": operações que rodam no navegador (renomear em lote, agrupar
 *      por data, converter) — sem enviar arquivo para servidor nenhum.
 */

export interface OperacaoArquivo {
  id: string;
  titulo: string;
  descricao: string;
}

export interface TipoArquivo {
  id: string;
  nome: string;
  cor: string;
  logo: string; // SVG inline (data-uri-free: renderiza direto)
  extensoes: string[];
  chamada: string;
  motor: "planilha" | "cliente";
  operacoes: OperacaoArquivo[];
}

export const TIPOS: TipoArquivo[] = [
  {
    id: "planilha",
    nome: "Planilhas",
    cor: "#217346", // verde Excel
    logo: "excel",
    extensoes: [".csv", ".xlsx", ".xls"],
    chamada: "Excel, CSV, Google Planilhas",
    motor: "planilha",
    operacoes: [
      { id: "limpar", titulo: "🧹 Limpar e padronizar", descricao: "Espaços, duplicados, vazios, acentos, MAIÚSC/minúsc" },
      { id: "normalizar", titulo: "💰 Normalizar valores", descricao: "Moeda (R$ 1.234,56 → 1234.56), datas para ISO, CEP com cidade/UF" },
      { id: "analisar", titulo: "🔎 Analisar os dados", descricao: "Perfil de cada coluna: tipo, preenchimento, mín/máx/média" },
      { id: "financeiro", titulo: "💹 Resumo financeiro", descricao: "Somar valores por categoria — ideal para gastos e vendas" },
      { id: "exportar", titulo: "📤 Exportar", descricao: "CSV, Excel, Word ou Google Planilhas/Docs" },
    ],
  },
  {
    id: "documento",
    nome: "Documentos",
    cor: "#2b579a", // azul Word
    logo: "word",
    extensoes: [".txt", ".md", ".csv"],
    chamada: "Word, texto, listas",
    motor: "cliente",
    operacoes: [
      { id: "tabela", titulo: "📊 Texto → tabela", descricao: "Transforma uma lista em tabela pronta para Word/Excel" },
      { id: "caixa", titulo: "🔠 Padronizar caixa", descricao: "Título, MAIÚSCULAS ou minúsculas em todo o texto" },
      { id: "linhas", titulo: "🧹 Limpar linhas", descricao: "Remove linhas em branco e espaços repetidos" },
      { id: "numerar", titulo: "🔢 Numerar itens", descricao: "Adiciona 1., 2., 3... em cada linha da lista" },
    ],
  },
  {
    id: "foto",
    nome: "Fotos & imagens",
    cor: "#c2410c", // laranja
    logo: "foto",
    extensoes: [".jpg", ".jpeg", ".png", ".webp"],
    chamada: "JPG, PNG, WebP",
    motor: "cliente",
    operacoes: [
      { id: "renomear", titulo: "🏷️ Renomear em lote", descricao: "viagem-001, viagem-002... com um padrão só" },
      { id: "data", titulo: "📅 Agrupar por data", descricao: "Separa as fotos em pastas por dia/mês de captura" },
      { id: "converter", titulo: "🔄 Converter formato", descricao: "PNG → JPG, ou reduzir o tamanho para enviar" },
      { id: "renomear-data", titulo: "🕐 Renomear pela data", descricao: "2026-07-17_praia.jpg — ordena sozinho no computador" },
    ],
  },
  {
    id: "arquivos",
    nome: "Arquivos por data",
    cor: "#7c3aed", // roxo Planify
    logo: "pastas",
    extensoes: ["*"],
    chamada: "Qualquer arquivo bagunçado",
    motor: "cliente",
    operacoes: [
      { id: "por-data", titulo: "📅 Organizar por data", descricao: "Separa em 2026/07, 2026/08... automaticamente" },
      { id: "por-tipo", titulo: "🗂️ Organizar por tipo", descricao: "Junta PDFs, imagens, planilhas em pastas próprias" },
      { id: "renomear-massa", titulo: "🏷️ Renomear em massa", descricao: "Padrão único para dezenas de arquivos de uma vez" },
      { id: "duplicados", titulo: "👯 Achar duplicados", descricao: "Encontra arquivos repetidos que ocupam espaço à toa" },
    ],
  },
  {
    id: "pdf",
    nome: "PDF",
    cor: "#b91c1c", // vermelho PDF
    logo: "pdf",
    extensoes: [".pdf"],
    chamada: "Relatórios, contratos, notas",
    motor: "cliente",
    operacoes: [
      { id: "juntar", titulo: "📎 Juntar PDFs", descricao: "Vários arquivos viram um só, na ordem que você escolher" },
      { id: "renomear-pdf", titulo: "🏷️ Renomear por conteúdo", descricao: "nota-fiscal-2026-07.pdf a partir do padrão do documento" },
      { id: "ordenar-pdf", titulo: "📅 Ordenar por data", descricao: "Organiza uma pilha de PDFs pela data de cada um" },
    ],
  },
];

export function tipoPorId(id: string): TipoArquivo | undefined {
  return TIPOS.find((t) => t.id === id);
}

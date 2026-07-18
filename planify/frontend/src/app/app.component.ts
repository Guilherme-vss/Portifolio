import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Opcoes,
  PlanilhaService,
  Processamento,
  RespostaOrganizacao,
} from "./planilha.service";
import { arquivoSuportado, csvParaBlobParts, formatarData, percentualMantido, tabelaParaHtml } from "./util";
import { TIPOS, TipoArquivo } from "./tipos-arquivo";
import {
  agruparPorData,
  aplicarCaixa,
  gerarNomes,
  numerarLinhas,
  scriptOrganizarPorData,
  scriptRenomear,
  textoParaTabela,
} from "./arquivo-ops";

/**
 * Componente raiz do Planify: um HUB por tipo de arquivo.
 *
 * A pessoa vê a logo do que trabalha (Excel, Word, fotos, PDF, arquivos por
 * data), clica e cai na ferramenta certa: o organizador de planilhas completo,
 * o formatador de texto ou o renomeador/organizador de arquivos em lote.
 */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {

  private readonly servico = inject(PlanilhaService);

  /* ---------- Navegação do hub ---------- */
  readonly TIPOS = TIPOS;
  tela: "hub" | "planilha" | "texto" | "arquivos" = "hub";
  tipoAtivo: TipoArquivo | null = null;

  abrirTipo(tipo: TipoArquivo) {
    this.tipoAtivo = tipo;
    if (tipo.id === "planilha") this.tela = "planilha";
    else if (tipo.id === "documento") this.tela = "texto";
    else this.tela = "arquivos"; // foto, arquivos, pdf
  }

  voltarAoHub() {
    this.tela = "hub";
    this.tipoAtivo = null;
    this.resultado = null;
    this.msg = "";
  }

  /* ---------- Ferramenta de texto (documentos) ---------- */
  texto = "";
  textoSaida = "";

  formatarTexto(op: "titulo" | "maiuscula" | "minuscula" | "numerar" | "tabela") {
    if (!this.texto.trim()) { this.textoSaida = ""; return; }
    if (op === "numerar") this.textoSaida = numerarLinhas(this.texto);
    else if (op === "tabela") {
      this.resultado = {
        linhas: textoParaTabela(this.texto),
        csv: textoParaTabela(this.texto).map((l) => l.join(";")).join("\n") + "\n",
        metricas: { linhasAntes: 0, linhasDepois: 0, vaziasRemovidas: 0, duplicadasRemovidas: 0, idProcessamento: 0 },
        perfil: [],
        resumoFinanceiro: null,
      };
      this.textoSaida = "";
    } else this.textoSaida = aplicarCaixa(this.texto, op);
  }

  copiarTexto() {
    navigator.clipboard?.writeText(this.textoSaida);
    this.msg = "Texto copiado! 📋";
  }

  /* ---------- Ferramenta de arquivos (foto / pdf / lote) ---------- */
  arquivosLote: File[] = [];
  padrao = "arquivo-{n3}";
  renomeados: { de: string; para: string }[] = [];
  gruposData: { pasta: string; arquivos: string[] }[] = [];

  aoEscolherLote(evento: Event) {
    this.arquivosLote = Array.from((evento.target as HTMLInputElement).files ?? []);
    this.renomeados = [];
    this.gruposData = [];
  }

  previewRenomear() {
    this.renomeados = gerarNomes(this.arquivosLote, this.padrao);
  }

  baixarScriptRenomear() {
    this.baixarTexto(scriptRenomear(this.renomeados), "renomear.bat");
  }

  previewPorData() {
    this.gruposData = agruparPorData(this.arquivosLote);
  }

  baixarScriptPorData() {
    this.baixarTexto(scriptOrganizarPorData(this.gruposData), "organizar-por-data.bat");
  }

  private baixarTexto(conteudo: string, nome: string) {
    this.baixarBlob(new Blob(["﻿" + conteudo], { type: "text/plain;charset=utf-8" }), nome);
  }

  arquivo: File | null = null;
  opcoes: Opcoes = {
    limparEspacos: true,
    removerVazias: true,
    removerDuplicadas: true,
    removerColunasVazias: false,
    removerAcentos: false,
    textoEmTitulo: false,
    preencherVazios: false,
    preencherVaziosCom: "—",
    normalizarMoeda: false,
    colunaMoeda: 0,
    normalizarData: false,
    colunaData: 0,
    maiuscula: false,
    colunaMaiuscula: 0,
    minuscula: false,
    colunaMinuscula: 0,
    normalizarCep: false,
    colunaCep: 0,
    ordenar: false,
    colunaOrdenacao: 0,
    ordemCrescente: true,
    resumoFinanceiro: false,
    colunaCategoria: 0,
    colunaValor: 1,
  };

  // controla qual bloco de opções está aberto (acordeão)
  abaAvancada = false;
  abaAnalise = false;

  resultado: RespostaOrganizacao | null = null;
  historico: Processamento[] = [];
  msg = "";
  erro = false;
  processando = false;

  // Barra de progresso: etapas do processamento exibidas ao usuário
  progresso = 0;
  etapaAtual = "";
  private readonly etapas = [
    "📖 Lendo o arquivo...",
    "🧹 Limpando os dados...",
    "🔀 Normalizando e organizando...",
    "🔎 Analisando as colunas...",
    "📦 Montando o resultado...",
  ];
  private timerProgresso: ReturnType<typeof setInterval> | null = null;

  // reexporta os utilitários para o template
  formatarData = formatarData;
  percentualMantido = percentualMantido;

  /** Rótulo amigável do tipo detectado de cada coluna (para o perfil). */
  rotuloTipo(tipo: string): string {
    return { NUMERO: "🔢 número", MOEDA: "💰 moeda", DATA: "📅 data", TEXTO: "🔤 texto", VAZIA: "⬜ vazia" }[tipo] ?? tipo;
  }

  real(valor: number | null): string {
    return (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  constructor() {
    this.carregarHistorico();
  }

  aoEscolherArquivo(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    this.arquivo = entrada.files?.[0] ?? null;
    this.msg = "";
  }

  organizar() {
    this.erro = false;
    if (!this.arquivo || !arquivoSuportado(this.arquivo.name)) {
      this.erro = true;
      this.msg = "Escolha um arquivo .csv ou .xlsx primeiro.";
      return;
    }

    this.processando = true;
    this.msg = "";
    this.iniciarProgresso();

    this.servico.organizar(this.arquivo, this.opcoes).subscribe({
      next: (resposta) => {
        this.concluirProgresso();
        this.resultado = resposta;
        this.msg = "Pronto! ✅";
        this.processando = false;
        this.carregarHistorico();
      },
      error: (falha) => {
        this.pararProgresso();
        this.erro = true;
        this.msg = falha?.error?.erro ?? "Algo deu errado — o backend está no ar?";
        this.processando = false;
      },
    });
  }

  /** Progresso animado: avança pelas etapas enquanto o servidor trabalha. */
  private iniciarProgresso() {
    this.progresso = 5;
    this.etapaAtual = this.etapas[0];
    let indice = 0;
    this.timerProgresso = setInterval(() => {
      // sobe suavemente até 90% e espera a resposta para fechar em 100%
      if (this.progresso < 90) {
        this.progresso += Math.max(1, Math.round((90 - this.progresso) / 8));
      }
      const nova = Math.min(this.etapas.length - 1, Math.floor(this.progresso / 20));
      if (nova !== indice) {
        indice = nova;
        this.etapaAtual = this.etapas[indice];
      }
    }, 180);
  }

  private concluirProgresso() {
    this.pararProgresso();
    this.progresso = 100;
    this.etapaAtual = "✅ Concluído!";
    setTimeout(() => (this.progresso = 0), 1600);
  }

  private pararProgresso() {
    if (this.timerProgresso) {
      clearInterval(this.timerProgresso);
      this.timerProgresso = null;
    }
  }

  baixarCsv() {
    if (!this.resultado) return;
    this.baixarBlob(new Blob(csvParaBlobParts(this.resultado.csv), { type: "text/csv;charset=utf-8" }),
      "planilha-organizada.csv");
  }

  /** Excel abre tabelas HTML nativamente — export sem biblioteca nenhuma. */
  baixarExcel() {
    if (!this.resultado) return;
    const html = tabelaParaHtml(this.resultado.linhas);
    this.baixarBlob(new Blob(["﻿" + html], { type: "application/vnd.ms-excel" }),
      "planilha-organizada.xls");
  }

  /** O mesmo truque vale para o Word: .doc a partir da tabela HTML. */
  baixarWord() {
    if (!this.resultado) return;
    const html = tabelaParaHtml(this.resultado.linhas);
    this.baixarBlob(new Blob(["﻿" + html], { type: "application/msword" }),
      "planilha-organizada.doc");
  }

  /**
   * Integração com o Google: baixa o arquivo e abre o Google Planilhas/Docs
   * na tela de importação — dois cliques e a planilha está na nuvem.
   * (Upload direto exigiria login OAuth do Google; este fluxo funciona
   * para qualquer pessoa, sem configurar nada.)
   */
  enviarParaGoogle(destino: "sheets" | "docs") {
    if (!this.resultado) return;
    if (destino === "sheets") {
      this.baixarCsv();
      window.open("https://docs.google.com/spreadsheets/create", "_blank");
      this.msg = "📄 CSV baixado! No Google Planilhas: Arquivo → Importar → Fazer upload.";
    } else {
      this.baixarWord();
      window.open("https://docs.google.com/document/create", "_blank");
      this.msg = "📄 Word baixado! No Google Docs: Arquivo → Abrir → Upload.";
    }
  }

  private baixarBlob(blob: Blob, nome: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nome;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private carregarHistorico() {
    this.servico.historico().subscribe({
      next: (lista) => (this.historico = lista),
      error: () => {}, // sem histórico não é erro fatal
    });
  }
}

import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Opcoes,
  PlanilhaService,
  Processamento,
  RespostaOrganizacao,
} from "./planilha.service";
import { arquivoSuportado, csvParaBlobParts, formatarData, percentualMantido } from "./util";

/**
 * Componente raiz do Planify: upload + opções → resultado + histórico.
 * Standalone (Angular 17): sem NgModule, dependências declaradas aqui mesmo.
 */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {

  private readonly servico = inject(PlanilhaService);

  arquivo: File | null = null;
  opcoes: Opcoes = {
    limparEspacos: true,
    removerVazias: true,
    removerDuplicadas: true,
    ordenar: false,
    colunaOrdenacao: 0,
    ordemCrescente: true,
    normalizarCep: false,
    colunaCep: 0,
  };

  resultado: RespostaOrganizacao | null = null;
  historico: Processamento[] = [];
  msg = "";
  erro = false;
  processando = false;

  // reexporta os utilitários para o template
  formatarData = formatarData;
  percentualMantido = percentualMantido;

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
    this.msg = "Organizando... (CEPs podem levar alguns segundos)";

    this.servico.organizar(this.arquivo, this.opcoes).subscribe({
      next: (resposta) => {
        this.resultado = resposta;
        this.msg = "Pronto! ✅";
        this.processando = false;
        this.carregarHistorico();
      },
      error: (falha) => {
        this.erro = true;
        this.msg = falha?.error?.erro ?? "Algo deu errado — o backend está no ar?";
        this.processando = false;
      },
    });
  }

  baixarCsv() {
    if (!this.resultado) return;
    const blob = new Blob(csvParaBlobParts(this.resultado.csv), {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "planilha-organizada.csv";
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

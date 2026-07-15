import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";

/** Formatos que a API devolve (espelham os DTOs do backend). */
export interface Metricas {
  linhasAntes: number;
  linhasDepois: number;
  vaziasRemovidas: number;
  duplicadasRemovidas: number;
  idProcessamento: number;
}

export interface RespostaOrganizacao {
  linhas: string[][];
  csv: string;
  metricas: Metricas;
}

export interface Processamento {
  id: number;
  nomeArquivo: string;
  operacoes: string;
  linhasAntes: number;
  linhasDepois: number;
  processadoEm: string;
}

export interface Opcoes {
  limparEspacos: boolean;
  removerVazias: boolean;
  removerDuplicadas: boolean;
  removerColunasVazias: boolean;
  textoEmTitulo: boolean;
  preencherVazios: boolean;
  preencherVaziosCom: string;
  ordenar: boolean;
  colunaOrdenacao: number;
  ordemCrescente: boolean;
  normalizarCep: boolean;
  colunaCep: number;
}

/** A demo (GitHub Pages) roda sem backend — respostas fictícias em memória. */
export function estaEmDemo(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.search.includes("demo=1"))
  );
}

const LINHAS_DEMO: string[][] = [
  ["nome", "cidade", "cep", "Cidade (ViaCEP)", "UF (ViaCEP)"],
  ["Ana Lima", "sao paulo", "01310-100", "São Paulo", "SP"],
  ["Bruno Souza", "Campinas", "13010-002", "Campinas", "SP"],
  ["Carla Nunes", "Curitiba", "80010-000", "Curitiba", "PR"],
  ["Diego Alves", "Recife", "50010-000", "Recife", "PE"],
];

/** Serviço que conversa com a API do Planify. */
@Injectable({ providedIn: "root" })
export class PlanilhaService {

  private readonly http = inject(HttpClient);

  private historicoDemo: Processamento[] = [
    { id: 3, nomeArquivo: "clientes.xlsx", operacoes: "limpar-espacos remover-duplicadas viacep:2",
      linhasAntes: 128, linhasDepois: 97, processadoEm: "2026-07-12T14:32:00" },
    { id: 2, nomeArquivo: "vendas.csv", operacoes: "remover-vazias ordenar:1",
      linhasAntes: 402, linhasDepois: 389, processadoEm: "2026-07-11T09:10:00" },
    { id: 1, nomeArquivo: "estoque.csv", operacoes: "limpar-espacos remover-vazias remover-duplicadas",
      linhasAntes: 76, linhasDepois: 60, processadoEm: "2026-07-10T16:45:00" },
  ];

  constructor() {
    // sem faixas: a versão local se comporta como o sistema completo
  }

  organizar(arquivo: File, opcoes: Opcoes): Observable<RespostaOrganizacao> {
    if (estaEmDemo()) {
      const resposta: RespostaOrganizacao = {
        linhas: LINHAS_DEMO,
        csv: LINHAS_DEMO.map((linha) => linha.join(";")).join("\n") + "\n",
        metricas: { linhasAntes: 9, linhasDepois: 5, vaziasRemovidas: 2, duplicadasRemovidas: 2, idProcessamento: 4 },
      };
      this.historicoDemo = [
        { id: 4, nomeArquivo: arquivo.name, operacoes: "organização local",
          linhasAntes: 9, linhasDepois: 5, processadoEm: new Date().toISOString() },
        ...this.historicoDemo,
      ];
      return of(resposta);
    }

    const dados = new FormData();
    dados.append("arquivo", arquivo);
    dados.append("limparEspacos", String(opcoes.limparEspacos));
    dados.append("removerVazias", String(opcoes.removerVazias));
    dados.append("removerDuplicadas", String(opcoes.removerDuplicadas));
    dados.append("removerColunasVazias", String(opcoes.removerColunasVazias));
    dados.append("textoEmTitulo", String(opcoes.textoEmTitulo));
    dados.append("preencherVaziosCom", opcoes.preencherVazios ? opcoes.preencherVaziosCom : "");
    dados.append("colunaOrdenacao", String(opcoes.ordenar ? opcoes.colunaOrdenacao : -1));
    dados.append("ordemCrescente", String(opcoes.ordemCrescente));
    dados.append("colunaCep", String(opcoes.normalizarCep ? opcoes.colunaCep : -1));
    return this.http.post<RespostaOrganizacao>("/api/organizar", dados);
  }

  historico(): Observable<Processamento[]> {
    if (estaEmDemo()) {
      return of([...this.historicoDemo]);
    }
    return this.http.get<Processamento[]>("/api/historico");
  }

}

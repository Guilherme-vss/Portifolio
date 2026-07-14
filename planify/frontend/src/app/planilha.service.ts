import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

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
  ordenar: boolean;
  colunaOrdenacao: number;
  ordemCrescente: boolean;
  normalizarCep: boolean;
  colunaCep: number;
}

/** Serviço que conversa com a API do Planify. */
@Injectable({ providedIn: "root" })
export class PlanilhaService {

  private readonly http = inject(HttpClient);

  organizar(arquivo: File, opcoes: Opcoes): Observable<RespostaOrganizacao> {
    const dados = new FormData();
    dados.append("arquivo", arquivo);
    dados.append("limparEspacos", String(opcoes.limparEspacos));
    dados.append("removerVazias", String(opcoes.removerVazias));
    dados.append("removerDuplicadas", String(opcoes.removerDuplicadas));
    dados.append("colunaOrdenacao", String(opcoes.ordenar ? opcoes.colunaOrdenacao : -1));
    dados.append("ordemCrescente", String(opcoes.ordemCrescente));
    dados.append("colunaCep", String(opcoes.normalizarCep ? opcoes.colunaCep : -1));
    return this.http.post<RespostaOrganizacao>("/api/organizar", dados);
  }

  historico(): Observable<Processamento[]> {
    return this.http.get<Processamento[]>("/api/historico");
  }
}

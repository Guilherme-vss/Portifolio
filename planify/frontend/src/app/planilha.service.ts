import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, from } from "rxjs";
import { organizarLocal, usarMotorLocal } from "./motor-local";

/** Formatos que a API devolve (espelham os DTOs do backend). */
export interface Metricas {
  linhasAntes: number;
  linhasDepois: number;
  vaziasRemovidas: number;
  duplicadasRemovidas: number;
  idProcessamento: number;
}

export type TipoColuna = "NUMERO" | "MOEDA" | "DATA" | "TEXTO" | "VAZIA";

export interface PerfilColuna {
  nome: string;
  tipo: TipoColuna;
  total: number;
  preenchidas: number;
  vazias: number;
  distintos: number;
  minimo: number | null;
  maximo: number | null;
  media: number | null;
  soma: number | null;
  percentualPreenchido: number;
}

export interface GrupoFinanceiro {
  categoria: string;
  soma: number;
  itens: number;
  percentual: number;
}

export interface ResumoFinanceiro {
  colunaCategoria: string;
  colunaValor: string;
  grupos: GrupoFinanceiro[];
  total: number;
}

export interface RespostaOrganizacao {
  linhas: string[][];
  csv: string;
  metricas: Metricas;
  perfil: PerfilColuna[];
  resumoFinanceiro: ResumoFinanceiro | null;
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
  // limpeza
  limparEspacos: boolean;
  removerVazias: boolean;
  removerDuplicadas: boolean;
  removerColunasVazias: boolean;
  removerAcentos: boolean;
  textoEmTitulo: boolean;
  preencherVazios: boolean;
  preencherVaziosCom: string;
  // normalização por coluna
  normalizarMoeda: boolean;
  colunaMoeda: number;
  normalizarData: boolean;
  colunaData: number;
  maiuscula: boolean;
  colunaMaiuscula: number;
  minuscula: boolean;
  colunaMinuscula: number;
  normalizarCep: boolean;
  colunaCep: number;
  // ordenação
  ordenar: boolean;
  colunaOrdenacao: number;
  ordemCrescente: boolean;
  // análise financeira
  resumoFinanceiro: boolean;
  colunaCategoria: number;
  colunaValor: number;
}

const CHAVE_HISTORICO = "planify-historico";

/** Serviço que conversa com a API do Planify (ou com o motor local no navegador). */
@Injectable({ providedIn: "root" })
export class PlanilhaService {

  private readonly http = inject(HttpClient);

  organizar(arquivo: File, opcoes: Opcoes): Observable<RespostaOrganizacao> {
    if (usarMotorLocal()) {
      // Processa o arquivo DE VERDADE no navegador e guarda no histórico local
      return from(
        organizarLocal(arquivo, opcoes).then((resposta) => {
          this.registrarLocal(arquivo.name, resposta);
          return resposta;
        })
      );
    }

    const dados = new FormData();
    dados.append("arquivo", arquivo);
    dados.append("limparEspacos", String(opcoes.limparEspacos));
    dados.append("removerVazias", String(opcoes.removerVazias));
    dados.append("removerDuplicadas", String(opcoes.removerDuplicadas));
    dados.append("removerColunasVazias", String(opcoes.removerColunasVazias));
    dados.append("removerAcentos", String(opcoes.removerAcentos));
    dados.append("textoEmTitulo", String(opcoes.textoEmTitulo));
    dados.append("preencherVaziosCom", opcoes.preencherVazios ? opcoes.preencherVaziosCom : "");
    dados.append("colunaMoeda", String(opcoes.normalizarMoeda ? opcoes.colunaMoeda : -1));
    dados.append("colunaData", String(opcoes.normalizarData ? opcoes.colunaData : -1));
    dados.append("colunaMaiuscula", String(opcoes.maiuscula ? opcoes.colunaMaiuscula : -1));
    dados.append("colunaMinuscula", String(opcoes.minuscula ? opcoes.colunaMinuscula : -1));
    dados.append("colunaCep", String(opcoes.normalizarCep ? opcoes.colunaCep : -1));
    dados.append("colunaOrdenacao", String(opcoes.ordenar ? opcoes.colunaOrdenacao : -1));
    dados.append("ordemCrescente", String(opcoes.ordemCrescente));
    dados.append("colunaCategoria", String(opcoes.resumoFinanceiro ? opcoes.colunaCategoria : -1));
    dados.append("colunaValor", String(opcoes.resumoFinanceiro ? opcoes.colunaValor : -1));
    return this.http.post<RespostaOrganizacao>("/api/organizar", dados);
  }

  historico(): Observable<Processamento[]> {
    if (usarMotorLocal()) {
      return from(Promise.resolve(this.lerHistoricoLocal()));
    }
    return this.http.get<Processamento[]>("/api/historico");
  }

  /* ---------- histórico local (localStorage) ---------- */

  private lerHistoricoLocal(): Processamento[] {
    try {
      const bruto = localStorage.getItem(CHAVE_HISTORICO);
      return bruto ? JSON.parse(bruto) : [];
    } catch {
      return [];
    }
  }

  private registrarLocal(nomeArquivo: string, resposta: RespostaOrganizacao): void {
    const registro: Processamento = {
      id: Date.now(),
      nomeArquivo,
      operacoes: "organização local",
      linhasAntes: resposta.metricas.linhasAntes,
      linhasDepois: resposta.metricas.linhasDepois,
      processadoEm: new Date().toISOString(),
    };
    const historico = [registro, ...this.lerHistoricoLocal()].slice(0, 20);
    try {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    } catch {
      /* sem espaço: ignora */
    }
  }
}

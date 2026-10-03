import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TituloFinanceiroResponse {
  id: number;
  idTitulo: string;
  viagemId: number;
  tipo: string;
  entidadeNome: string;
  operacao: string;
  numeroRota: string;
  numeroCte: string;
  numeroMdfe: string;
  origem: string;
  destino: string;
  perfilVeiculo: string;
  placa: string;
  valorFrete: number;
  valorAdicional: number;
  totalPrevisto: number;
  totalRealizado: number;
  saldoEmAberto: number;
  status: string;
  dataColeta: string;
  dataEntrega: string;
  dataPagamento: string;
  proximoVencimento: string;
  observacao: string;
}

export interface LancamentoFinanceiroResponse {
  id: number;
  viagemId: number;
  tipo: string;
  etapa: string;
  tipoAdicional: string;
  entidadeNome: string;
  valorPrevisto: number;
  valorRealizado: number;
  saldoEmAberto: number;
  dataVencimento: string;
  dataEfetiva: string;
  status: string;
  numeroCte: string;
  numeroMdfe: string;
  comprovanteUrl: string;
  observacao: string;
  titulo?: TituloFinanceiroResponse;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/financeiro`;

  listarContasReceber(): Observable<TituloFinanceiroResponse[]> {
    return this.http.get<TituloFinanceiroResponse[]>(`${this.apiUrl}/receber`);
  }

  listarContasPagar(): Observable<TituloFinanceiroResponse[]> {
    return this.http.get<TituloFinanceiroResponse[]>(`${this.apiUrl}/pagar`);
  }

  listarLancamentos(): Observable<LancamentoFinanceiroResponse[]> {
    return this.http.get<LancamentoFinanceiroResponse[]>(`${this.apiUrl}/lancamentos`);
  }

  liquidarParcela(id: number, valorRealizado: number, dataEfetiva: string, arquivo?: File, obs?: string): Observable<LancamentoFinanceiroResponse> {
    const formData = new FormData();
    formData.append('valorRealizado', valorRealizado.toString());
    formData.append('dataEfetiva', dataEfetiva);
    if (arquivo) {
      formData.append('arquivo', arquivo);
    }
    if (obs) {
      formData.append('obs', obs);
    }
    return this.http.post<LancamentoFinanceiroResponse>(`${this.apiUrl}/lancamentos/${id}/baixa`, formData);
  }
}
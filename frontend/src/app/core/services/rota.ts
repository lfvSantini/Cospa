import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LocalCliente {
  id?: number;
  clienteId: number;
  clienteNome?: string;
  nomeLocal: string;
  endereco: string;
  cep?: string;
  cidade: string;
  uf: string;
  complemento?: string;
  linkLocalizacao?: string;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.endsWith('/api')
    ? `${environment.apiUrl}/rotas`
    : `${environment.apiUrl}/api/rotas`;

  listar(): Observable<LocalCliente[]> {
    return this.http.get<LocalCliente[]>(this.apiUrl);
  }

  buscarPorClienteId(clienteId: number): Observable<LocalCliente[]> {
    return this.http.get<LocalCliente[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  buscarPorNomeCliente(nome: string): Observable<LocalCliente[]> {
    return this.http.get<LocalCliente[]>(`${this.apiUrl}/cliente-nome/${encodeURIComponent(nome)}`);
  }

  salvar(local: LocalCliente): Observable<LocalCliente> {
    if (local.id) {
      return this.http.put<LocalCliente>(`${this.apiUrl}/${local.id}`, local);
    }
    return this.http.post<LocalCliente>(this.apiUrl, local);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
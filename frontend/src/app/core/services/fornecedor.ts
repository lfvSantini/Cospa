import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fornecedor } from '../models/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private http = inject(HttpClient);

  private baseUrl = environment.apiUrl.endsWith('/api')
    ? `${environment.apiUrl}/fornecedores`
    : `${environment.apiUrl}/api/fornecedores`;

  listar(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/${id}`);
  }

  salvar(fornecedor: any): Observable<Fornecedor> {
    if (fornecedor.id) {
      return this.http.put<Fornecedor>(`${this.baseUrl}/${fornecedor.id}`, fornecedor);
    }
    return this.http.post<Fornecedor>(this.baseUrl, fornecedor);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
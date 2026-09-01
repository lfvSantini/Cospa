import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/veiculos`;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  listar(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  salvar(veiculo: any): Observable<any> {
    if (veiculo.id) {
      return this.http.put<any>(`${this.apiUrl}/${veiculo.id}`, veiculo, { headers: this.headers });
    }
    return this.http.post<any>(this.apiUrl, veiculo, { headers: this.headers });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadDocumento(veiculoId: number, descricao: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('descricao', descricao);
    formData.append('nome', descricao);
    formData.append('tipo', descricao);
    return this.http.post<any>(`${this.apiUrl}/${veiculoId}/documentos`, formData);
  }

  deletarDocumento(docId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documentos/${docId}`);
  }
}
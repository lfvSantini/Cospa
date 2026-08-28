import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Motorista } from '../models/motorista.model';

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/motoristas`;

  listar(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/${id}`);
  }

  salvar(motorista: Motorista): Observable<Motorista> {
    if (motorista.id) {
      return this.http.put<Motorista>(`${this.apiUrl}/${motorista.id}`, motorista);
    }
    return this.http.post<Motorista>(this.apiUrl, motorista);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadDocumento(id: number, tipo: string, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('arquivo', arquivo);
    return this.http.post<any>(`${this.apiUrl}/${id}/documentos`, formData);
  }

  deletarDocumentoExtra(documentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documentos/${documentoId}`);
  }
}
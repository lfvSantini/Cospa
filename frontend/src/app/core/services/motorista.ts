import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Motorista, MotoristaDocumento } from '../models/motorista.model';

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/motoristas`;

  listar(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(this.baseUrl);
  }

  salvar(motorista: Motorista): Observable<Motorista> {
    if (motorista.id) {
      return this.http.put<Motorista>(`${this.baseUrl}/${motorista.id}`, motorista);
    }
    return this.http.post<Motorista>(this.baseUrl, motorista);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadDocumento(motoristaId: number, tipo: 'CNH' | 'CRLV' | 'COMP_ENDERECO', file: File): Observable<Motorista> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    return this.http.post<Motorista>(`${this.baseUrl}/${motoristaId}/documentos`, formData);
  }

  deletarDocumentoExtra(docId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/documentos-extras/${docId}`);
  }
}
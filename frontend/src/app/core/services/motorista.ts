import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Motorista } from '../models/motorista.model';
import { environment } from '../../../environments/environment';

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

  uploadDocumento(motoristaId: number, tipo: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    formData.append('nome', tipo);
    formData.append('descricao', tipo);

    return this.http.post<any>(`${this.apiUrl}/${motoristaId}/documentos`, formData);
  }

  deletarDocumentoExtra(docId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documentos-extras/${docId}`);
  }
}
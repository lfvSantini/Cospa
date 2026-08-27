import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Viagem, Comprovante } from '../models/viagem.model';

@Injectable({
  providedIn: 'root'
})
export class ViagemService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/viagens`;

  listarTodas(): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Viagem> {
    return this.http.get<Viagem>(`${this.baseUrl}/${id}`);
  }

  salvar(viagem: Viagem): Observable<Viagem> {
    if (viagem.id) {
      return this.http.put<Viagem>(`${this.baseUrl}/${viagem.id}`, viagem);
    }
    return this.http.post<Viagem>(this.baseUrl, viagem);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadComprovante(viagemId: number, nome: string, file: File): Observable<Comprovante> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nome', nome);

    return this.http.post<Comprovante>(`${this.baseUrl}/${viagemId}/comprovantes`, formData);
  }

  deletarComprovante(viagemId: number, comprovanteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${viagemId}/comprovantes/${comprovanteId}`);
  }
}
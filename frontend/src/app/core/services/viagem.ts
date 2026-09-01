import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../models/viagem.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViagemService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/viagens`;

  listarTodas(): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Viagem> {
    return this.http.get<Viagem>(`${this.apiUrl}/${id}`);
  }

  criar(viagem: any): Observable<Viagem> {
    return this.http.post<Viagem>(this.apiUrl, viagem);
  }

  atualizar(id: number, viagem: any): Observable<Viagem> {
    return this.http.put<Viagem>(`${this.apiUrl}/${id}`, viagem);
  }

  salvar(viagem: any, isEdicao: boolean = false): Observable<Viagem> {
    if (isEdicao && viagem.id) {
      return this.http.put<Viagem>(`${this.apiUrl}/${viagem.id}`, viagem);
    }
    return this.http.post<Viagem>(this.apiUrl, viagem);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadComprovante(viagemId: number, nome: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nome', nome);
    return this.http.post<any>(`${this.apiUrl}/${viagemId}/comprovantes`, formData);
  }

  deletarComprovante(viagemId: number, comprovanteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${viagemId}/comprovantes/${comprovanteId}`);
  }
}
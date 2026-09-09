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
  
  // Garante a rota correta alinhada ao endpoint de viagens do Controller
  private apiUrl = environment.apiUrl.endsWith('/api') 
    ? `${environment.apiUrl}/viagens` 
    : `${environment.apiUrl}/api/viagens`;

  listarTodas(): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Viagem> {
    return this.http.get<Viagem>(`${this.apiUrl}/${id}`);
  }

  criar(viagem: any): Observable<Viagem> {
    const payload = { ...viagem };
    delete payload.id; // Garante que a primary key seja gerada pelo banco
    return this.http.post<Viagem>(this.apiUrl, payload);
  }

  atualizar(id: number, viagem: any): Observable<Viagem> {
    return this.http.put<Viagem>(`${this.apiUrl}/${id}`, viagem);
  }

  salvar(viagem: any, isEdicao: boolean = false, idOriginal?: number | null): Observable<Viagem> {
    const idDestino = idOriginal || viagem.id;
    if (isEdicao && idDestino) {
      return this.http.put<Viagem>(`${this.apiUrl}/${idDestino}`, viagem);
    }
    
    // Na criação de nova viagem, remove o id técnico para preservar a sequência do AUTO_INCREMENT
    const payload = { ...viagem };
    delete payload.id;
    return this.http.post<Viagem>(this.apiUrl, payload);
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
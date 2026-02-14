import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../../models/viagem.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ViagemService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/viagem`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(`${this.apiUrl}/findAll`);
  }

  findById(id: string): Observable<Viagem> {
    return this.http.get<Viagem>(`${this.apiUrl}/${id}`);
  }

  create(viagem: Partial<Viagem>): Observable<Viagem> {
    return this.http.post<Viagem>(this.apiUrl, viagem);
  }

  update(id: string, viagem: Partial<Viagem>): Observable<Viagem> {
    return this.http.put<Viagem>(`${this.apiUrl}/${id}`, viagem);
  }
}

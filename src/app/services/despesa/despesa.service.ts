import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Despesa } from '../../models/viagem.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({ providedIn: 'root' })
export class DespesaService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/despesas`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(this.apiUrl);
  }

  findById(id: string): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.apiUrl}/${id}`);
  }

  findByViagemId(viagemId: string): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(`${this.apiUrl}/viagem/${viagemId}`);
  }

  create(despesa: Partial<Despesa>): Observable<Despesa> {
    return this.http.post<Despesa>(this.apiUrl, despesa);
  }

  update(id: string, despesa: Partial<Despesa>): Observable<Despesa> {
    return this.http.put<Despesa>(`${this.apiUrl}/${id}`, despesa);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

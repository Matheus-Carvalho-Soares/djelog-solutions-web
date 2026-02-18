import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estadia } from '../../models/estadia.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EstadiaService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/estadias`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Estadia[]> {
    return this.http.get<Estadia[]>(this.apiUrl);
  }

  findById(id: string): Observable<Estadia> {
    return this.http.get<Estadia>(`${this.apiUrl}/${id}`);
  }

  findByViagemId(viagemId: string): Observable<Estadia[]> {
    return this.http.get<Estadia[]>(`${this.apiUrl}/viagem/${viagemId}`);
  }

  create(estadia: Partial<Estadia>): Observable<Estadia> {
    return this.http.post<Estadia>(this.apiUrl, estadia);
  }

  update(id: string, estadia: Partial<Estadia>): Observable<Estadia> {
    return this.http.put<Estadia>(`${this.apiUrl}/${id}`, estadia);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

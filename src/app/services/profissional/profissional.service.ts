import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { Profissional } from '../../models/profissional.model';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/profissional`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(`${this.apiUrl}/findAll`);
  }

  create(profissional: Partial<Profissional>): Observable<Profissional> {
    return this.http.post<Profissional>(this.apiUrl, profissional);
  }

  update(id: string, profissional: Partial<Profissional>): Observable<Profissional> {
    return this.http.put<Profissional>(`${this.apiUrl}/${id}`, profissional);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../../models/empresa.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/empresa`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/findAll`);
  }

  findById(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  create(empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  update(id: string, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }
}

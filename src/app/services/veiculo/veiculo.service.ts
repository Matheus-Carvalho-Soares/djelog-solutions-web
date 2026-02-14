import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { Veiculo } from '../../models/veiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/veiculo`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}/findAll`);
  }

  create(veiculo: Partial<Veiculo>): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, veiculo);
  }

  update(id: string, veiculo: Partial<Veiculo>): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, veiculo);
  }
}

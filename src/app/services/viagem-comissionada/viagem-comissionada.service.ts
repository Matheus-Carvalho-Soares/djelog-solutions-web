import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViagemComissionada } from '../../models/viagem-comissionada.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ViagemComissionadaService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/viagem-comissionada`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<ViagemComissionada[]> {
    return this.http.get<ViagemComissionada[]>(this.apiUrl);
  }

  findById(id: string): Observable<ViagemComissionada> {
    return this.http.get<ViagemComissionada>(`${this.apiUrl}/${id}`);
  }

  findByInicioFrete(inicioFrete: string): Observable<ViagemComissionada[]> {
    return this.http.get<ViagemComissionada[]>(`${this.apiUrl}/search/inicio-frete`, {
      params: { inicioFrete }
    });
  }

  findByFimFrete(fimFrete: string): Observable<ViagemComissionada[]> {
    return this.http.get<ViagemComissionada[]>(`${this.apiUrl}/search/fim-frete`, {
      params: { fimFrete }
    });
  }

  create(viagem: Partial<ViagemComissionada>): Observable<ViagemComissionada> {
    return this.http.post<ViagemComissionada>(this.apiUrl, viagem);
  }

  update(id: string, viagem: Partial<ViagemComissionada>): Observable<ViagemComissionada> {
    return this.http.put<ViagemComissionada>(`${this.apiUrl}/${id}`, viagem);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

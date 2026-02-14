import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViagemRelatorioDTO } from '../../models/relatorio.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/viagem/excel`;

  constructor(private http: HttpClient) {}

  getRelatorioPorData(dataInicio: string, dataFim: string): Observable<ViagemRelatorioDTO[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get<ViagemRelatorioDTO[]>(`${this.apiUrl}/dados`, { params });
  }
}

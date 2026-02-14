import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { Viagem } from 'src/app/models/viagem.model';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/viagem`;

  constructor(private http: HttpClient) { }

  findAllReceitaByUsuario(): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(`${this.apiUrl}/findAllReceitaByUsuario`);
  }
}

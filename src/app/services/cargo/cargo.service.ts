import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo } from '../../models/cargo.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/cargo`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(`${this.apiUrl}/findAll`);
  }
}

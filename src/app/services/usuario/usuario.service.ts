import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../../models/usuario.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/auth/usuario`;

  constructor(private http: HttpClient) {}

  update(id: string, usuario: Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, usuario);
  }
}

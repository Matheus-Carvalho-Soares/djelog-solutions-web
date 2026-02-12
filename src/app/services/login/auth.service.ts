import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UsuarioDTO } from '../../models/usuario.model';
import { API_CONFIG } from '../../config/api.config';

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  usuario?: UsuarioDTO;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // TODO: Update with actual API URL
  private apiUrl = `${API_CONFIG.baseUrl}/api/auth`;
  
  constructor(private http: HttpClient) { }

  /**
   * Método de login - preparado para integração futura com backend
   * 
   * @param email - Email do usuário
   * @param senha - Senha do usuário
   * @returns Observable com resposta do login
   */
  login(email: string, senha: string): Observable<LoginResponse> {
    console.log('Login attempt:', { email, senha});
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha });
  }
  /**
   * Método de registro de novo usuário
   * 
   * @param usuario - Dados do usuário para registro
   * @returns Observable com resposta do registro
   */
  register(usuario: UsuarioDTO): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, usuario);
  }
}

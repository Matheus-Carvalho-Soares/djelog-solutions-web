import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/login/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  sucessMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Getter para facilitar acesso aos controles do formulário no template
   */
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Submete o formulário de login
   */
  onSubmit(): void {
    // Limpa mensagens de erro anteriores
    this.errorMessage = '';

    // Valida o formulário
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Inicia o loading
    this.isLoading = true;

    // Obtém os valores do formulário
    const { email, password } = this.loginForm.value;

    // Chama o serviço de autenticação

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        
        if (response.success) {
          console.log(response);
          sessionStorage.setItem('authToken', response.token || '');
          sessionStorage.setItem('userId', response.userId || '');
          sessionStorage.setItem('userEmail', response.email || '');
          sessionStorage.setItem('userName', response.userName || '');
          this.sucessMessage = response.message || 'Login realizado com sucesso!';
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Erro ao fazer login';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error.message || 'Erro ao fazer login';
        console.error('Erro no login:', error);
      }
    });
  }

  /**
   * Retorna mensagem de erro específica para o campo email
   */
  getEmailError(): string {
    if (this.email?.hasError('required')) {
      return 'Digite seu email';
    }
    if (this.email?.hasError('email')) {
      return 'Email inválido';
    }
    return '';
  }

  /**
   * Retorna mensagem de erro específica para o campo senha
   */
  getPasswordError(): string {
    if (this.password?.hasError('required')) {
      return 'Digite sua senha';
    }
    if (this.password?.hasError('minlength')) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }

    /**
   * Navega para a página de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

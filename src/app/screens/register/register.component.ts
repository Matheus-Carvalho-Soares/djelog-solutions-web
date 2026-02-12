import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterResponse } from '../../services/login/auth.service';
import { CargoService } from '../../services/cargo/cargo.service';
import { Cargo } from '../../models/cargo.model';
import { UsuarioDTO } from '../../models/usuario.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  cargos: Cargo[] = [];
  loadingCargos: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cargoService: CargoService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmSenha: ['', [Validators.required]],
      cargo: [{ value: '', disabled: true }, [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    this.loadCargos();
  }

  /**
   * Carrega lista de cargos disponíveis
   */
  loadCargos(): void {
    this.loadingCargos = true;
    this.registerForm.get('cargo')?.disable();
    this.cargoService.findAll().subscribe({
      next: (cargos: Cargo[]) => {
        this.cargos = cargos;
        this.loadingCargos = false;
        this.registerForm.get('cargo')?.enable();
      },
      error: (error) => {
        console.error('Erro ao carregar cargos:', error);
        this.loadingCargos = false;
        this.errorMessage = 'Erro ao carregar cargos. Tente novamente.';
      }
    });
  }

  /**
   * Validador customizado para verificar se as senhas coincidem
   */
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const senha = group.get('senha')?.value;
    const confirmSenha = group.get('confirmSenha')?.value;
    
    if (senha && confirmSenha && senha !== confirmSenha) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Getters para facilitar acesso aos controles do formulário no template
   */
  get nome() {
    return this.registerForm.get('nome');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get senha() {
    return this.registerForm.get('senha');
  }

  get confirmSenha() {
    return this.registerForm.get('confirmSenha');
  }

  get cargo() {
    return this.registerForm.get('cargo');
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna visibilidade da confirmação de senha
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Submete o formulário de registro
   */
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.errorMessage = '';
    this.successMessage = '';

    // Valida o formulário
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Inicia o loading
    this.isLoading = true;

    // Obtém os valores do formulário
    const formValue = this.registerForm.value;
    
    // Encontra o objeto Cargo completo
    const cargoSelecionado = this.cargos.find(c => c.id === formValue.cargo);
    
    if (!cargoSelecionado) {
      this.errorMessage = 'Cargo não encontrado';
      this.isLoading = false;
      return;
    }

    // Prepara o DTO
    const usuario: UsuarioDTO = {
      nome: formValue.nome,
      email: formValue.email,
      senha: formValue.senha,
      cargo: cargoSelecionado
    };

    // Chama o serviço de registro
    this.authService.register(usuario).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading = false;
          this.successMessage = 'Cadastro realizado com sucesso!';

          // Limpa o formulário
          this.registerForm.reset();
          
          // Redireciona para login após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
        console.error('Erro no registro:', error);
      }
    });
  }

  /**
   * Retorna mensagem de erro específica para o campo nome
   */
  getNomeError(): string {
    if (this.nome?.hasError('required')) {
      return 'Digite seu nome completo';
    }
    if (this.nome?.hasError('minlength')) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    return '';
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
  getSenhaError(): string {
    if (this.senha?.hasError('required')) {
      return 'Digite uma senha';
    }
    if (this.senha?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  }

  /**
   * Retorna mensagem de erro específica para o campo confirmar senha
   */
  getConfirmSenhaError(): string {
    if (this.confirmSenha?.hasError('required')) {
      return 'Confirme sua senha';
    }
    if (this.registerForm.hasError('passwordMismatch') && this.confirmSenha?.touched) {
      return 'As senhas não coincidem';
    }
    return '';
  }

  /**
   * Retorna mensagem de erro específica para o campo cargo
   */
  getCargoError(): string {
    if (this.cargo?.hasError('required')) {
      return 'Selecione um cargo';
    }
    return '';
  }

  /**
   * Navega para a página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

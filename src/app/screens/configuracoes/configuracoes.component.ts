import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../services/usuario/usuario.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css']
})
export class ConfiguracoesComponent implements OnInit {
  userId = '';
  nome = '';
  email = '';
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  isSaving = false;
  showSenhaAtual = false;
  showNovaSenha = false;
  showConfirmarSenha = false;

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('userId') || '';
    this.nome = sessionStorage.getItem('userName') || '';
    this.email = sessionStorage.getItem('userEmail') || '';
  }

  get isProfileValid(): boolean {
    return this.nome.trim().length > 0 && this.email.trim().length > 0;
  }

  get isPasswordValid(): boolean {
    return (
      this.novaSenha.length >= 6 &&
      this.novaSenha === this.confirmarSenha
    );
  }

  get passwordMismatch(): boolean {
    return this.confirmarSenha.length > 0 && this.novaSenha !== this.confirmarSenha;
  }

  saveProfile(): void {
    if (!this.isProfileValid || this.isSaving) return;

    this.isSaving = true;

    this.usuarioService.update(this.userId, {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: ''
    }).subscribe({
      next: () => {
        sessionStorage.setItem('userName', this.nome.trim());
        sessionStorage.setItem('userEmail', this.email.trim());
        this.showSuccess('Perfil atualizado com sucesso');
        this.isSaving = false;
      },
      error: () => {
        this.showError('Erro ao atualizar perfil');
        this.isSaving = false;
      }
    });
  }

  savePassword(): void {
    if (!this.isPasswordValid || this.isSaving) return;

    this.isSaving = true;

    this.usuarioService.update(this.userId, {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.novaSenha
    }).subscribe({
      next: () => {
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
        this.showSuccess('Senha alterada com sucesso');
        this.isSaving = false;
      },
      error: () => {
        this.showError('Erro ao alterar senha');
        this.isSaving = false;
      }
    });
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      panelClass: ['neon-snackbar']
    });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Fechar', {
      duration: 5000,
      panelClass: ['neon-snackbar']
    });
  }
}

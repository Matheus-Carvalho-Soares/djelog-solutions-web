import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfissionalService } from '../../../services/profissional/profissional.service';
import { Profissional } from '../../../models/profissional.model';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-create-motorista-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-motorista-dialog.component.html',
  styleUrls: ['./create-motorista-dialog.component.css']
})
export class CreateMotoristaDialogComponent {
  nome = '';
  telefone = '';
  status = true;
  isSaving = false;
  errorMessage = '';
  private profissionalId: string | undefined;
  private existingUsuario: unknown;

  constructor(
    private dialogRef: MatDialogRef<CreateMotoristaDialogComponent>,
    private profissionalService: ProfissionalService,
    @Inject(MAT_DIALOG_DATA) public data?: { profissional?: Profissional }
  ) {
    const profissional = data?.profissional as Profissional | undefined;
    if (profissional) {
      this.profissionalId = profissional.id;
      this.nome = profissional.nome || '';
      this.telefone = profissional.telefone || '';
      this.status = profissional.status ?? true;
      this.existingUsuario = (profissional as unknown as { usuario?: unknown }).usuario;
    }
  }

  get isEditMode(): boolean {
    return !!this.profissionalId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR MOTORISTA' : 'NOVO MOTORISTA';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados do profissional' : 'Cadastrar profissional no sistema';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERACOES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return this.nome.trim().length > 0;
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const profissional: Partial<Profissional> & { usuario?: unknown } = {
      nome: this.nome.trim(),
      telefone: this.telefone.trim() || undefined,
      status: this.status
    };

    if (this.existingUsuario) {
      profissional.usuario = this.existingUsuario;
    }

    const request$ = this.isEditMode && this.profissionalId
      ? this.profissionalService.update(this.profissionalId, profissional)
      : this.profissionalService.create(profissional);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar motorista:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

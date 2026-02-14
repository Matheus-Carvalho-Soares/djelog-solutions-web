import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { Empresa } from '../../../models/empresa.model';

@Component({
  selector: 'app-create-empresa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-empresa-dialog.component.html',
  styleUrls: ['./create-empresa-dialog.component.css']
})
export class CreateEmpresaDialogComponent {
  nome = '';
  descricao = '';
  isSaving = false;
  errorMessage = '';
  private empresaId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateEmpresaDialogComponent>,
    private empresaService: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data?: { empresa?: Empresa }
  ) {
    const empresa = data?.empresa as Empresa | undefined;
    if (empresa) {
      this.empresaId = empresa.id;
      this.nome = empresa.nome || '';
      this.descricao = empresa.descricao || '';
    }
  }

  get isEditMode(): boolean {
    return !!this.empresaId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR EMPRESA' : 'NOVA EMPRESA';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados da empresa' : 'Cadastrar empresa no sistema';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return this.nome.trim().length > 0;
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const empresa: Partial<Empresa> = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || undefined
    };

    const request$ = this.isEditMode && this.empresaId
      ? this.empresaService.update(this.empresaId, empresa)
      : this.empresaService.create(empresa);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar empresa:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

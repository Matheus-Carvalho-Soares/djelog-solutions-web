import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViagemComissionadaService } from '../../../services/viagem-comissionada/viagem-comissionada.service';
import { ViagemComissionada } from '../../../models/viagem-comissionada.model';

@Component({
  selector: 'app-create-viagem-comissionada-dialog',
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
  templateUrl: './create-viagem-comissionada-dialog.component.html',
  styleUrls: ['./create-viagem-comissionada-dialog.component.css']
})
export class CreateViagemComissionadaDialogComponent {
  // Form fields
  inicioFrete = '';
  fimFrete = '';
  valor: number | null = null;
  comissao: number | null = null;
  descricao = '';

  // State
  isSaving = false;
  errorMessage = '';

  private viagemId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateViagemComissionadaDialogComponent>,
    private viagemComissionadaService: ViagemComissionadaService,
    @Inject(MAT_DIALOG_DATA) public data?: { viagem?: ViagemComissionada }
  ) {
    const viagem = data?.viagem as ViagemComissionada | undefined;
    if (viagem) {
      this.viagemId = viagem.id;
      this.inicioFrete = viagem.inicioFrete || '';
      this.fimFrete = viagem.fimFrete || '';
      this.valor = viagem.valor ?? null;
      this.comissao = viagem.comissao ?? null;
      this.descricao = viagem.descricao || '';
    }
  }

  get isEditMode(): boolean {
    return !!this.viagemId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR VIAGEM COMISSIONADA' : 'NOVA VIAGEM COMISSIONADA';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados da viagem comissionada' : 'Registrar nova viagem comissionada';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return (
      this.inicioFrete.trim().length > 0 &&
      this.valor !== null && this.valor >= 0
    );
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const viagem: Partial<ViagemComissionada> = {
      inicioFrete: this.inicioFrete.trim(),
      fimFrete: this.fimFrete.trim(),
      valor: this.valor ?? 0,
      comissao: this.comissao ?? 0,
      descricao: this.descricao.trim()
    };

    const request$ = this.isEditMode && this.viagemId
      ? this.viagemComissionadaService.update(this.viagemId, viagem)
      : this.viagemComissionadaService.create(viagem);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar viagem comissionada:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

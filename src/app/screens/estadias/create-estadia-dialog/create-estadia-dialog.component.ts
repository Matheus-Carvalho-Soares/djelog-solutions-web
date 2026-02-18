import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadiaService } from '../../../services/estadia/estadia.service';
import { ViagemService } from '../../../services/viagem/viagem.service';
import { Estadia } from '../../../models/estadia.model';
import { Viagem } from '../../../models/viagem.model';

@Component({
  selector: 'app-create-estadia-dialog',
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
  templateUrl: './create-estadia-dialog.component.html',
  styleUrls: ['./create-estadia-dialog.component.css']
})
export class CreateEstadiaDialogComponent implements OnInit {
  // Form fields
  selectedViagemId: string | null = null;
  descricao = '';
  valor: number | null = null;

  // Lists
  viagens: Viagem[] = [];

  // State
  isLoadingData = false;
  isSaving = false;
  errorMessage = '';

  private estadiaId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateEstadiaDialogComponent>,
    private estadiaService: EstadiaService,
    private viagemService: ViagemService,
    @Inject(MAT_DIALOG_DATA) public data?: { estadia?: Estadia }
  ) {
    const estadia = data?.estadia as Estadia | undefined;
    if (estadia) {
      this.estadiaId = estadia.id;
      this.selectedViagemId = (estadia.viagem as any)?.id ?? null;
      this.descricao = estadia.descricao || '';
      this.valor = estadia.valor ?? null;
    }
  }

  ngOnInit(): void {
    this.loadViagens();
  }

  get isEditMode(): boolean {
    return !!this.estadiaId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR ESTADIA' : 'NOVA ESTADIA';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados da estadia' : 'Registrar nova taxa de estadia';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return (
      this.selectedViagemId !== null &&
      this.valor !== null && this.valor >= 0
    );
  }

  getViagemLabel(v: Viagem): string {
    const parts: string[] = [];
    if (v.inicioFrete) parts.push(v.inicioFrete);
    if (v.fimFrete) parts.push('→ ' + v.fimFrete);
    if (v.empresa && (v.empresa as any).nome) parts.push('(' + (v.empresa as any).nome + ')');
    return parts.length > 0 ? parts.join(' ') : (v.id || '—');
  }

  loadViagens(): void {
    this.isLoadingData = true;
    this.viagemService.findAll().subscribe({
      next: (data) => { this.viagens = data || []; this.isLoadingData = false; },
      error: () => { this.isLoadingData = false; }
    });
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const estadia: Partial<Estadia> = {
      viagem: this.selectedViagemId ? { id: this.selectedViagemId } : undefined,
      descricao: this.descricao.trim(),
      valor: this.valor ?? 0
    };

    const request$ = this.isEditMode && this.estadiaId
      ? this.estadiaService.update(this.estadiaId, estadia)
      : this.estadiaService.create(estadia);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar estadia:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

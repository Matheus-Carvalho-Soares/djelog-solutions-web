import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VeiculoService } from '../../../services/veiculo/veiculo.service';
import { ProfissionalService } from '../../../services/profissional/profissional.service';
import { Veiculo } from '../../../models/veiculo.model';
import { Profissional } from '../../../models/profissional.model';

@Component({
  selector: 'app-create-veiculo-dialog',
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
  templateUrl: './create-veiculo-dialog.component.html',
  styleUrls: ['./create-veiculo-dialog.component.css']
})
export class CreateVeiculoDialogComponent implements OnInit {
  marca = '';
  placa = '';
  ano: number | null = null;
  selectedProfissionalId: string | null = null;
  status = true;
  isSaving = false;
  errorMessage = '';

  profissionais: Profissional[] = [];
  isLoadingProfissionais = false;

  private veiculoId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateVeiculoDialogComponent>,
    private veiculoService: VeiculoService,
    private profissionalService: ProfissionalService,
    @Inject(MAT_DIALOG_DATA) public data?: { veiculo?: Veiculo }
  ) {
    const veiculo = data?.veiculo as Veiculo | undefined;
    if (veiculo) {
      this.veiculoId = veiculo.id;
      this.marca = veiculo.marca || '';
      this.placa = veiculo.placa || '';
      this.ano = veiculo.ano ?? null;
      this.selectedProfissionalId = veiculo.profissional?.id ?? null;
      this.status = veiculo.status ?? true;
    }
  }

  ngOnInit(): void {
    this.loadProfissionais();
  }

  get isEditMode(): boolean {
    return !!this.veiculoId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR VEÍCULO' : 'NOVO VEÍCULO';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados do veículo' : 'Cadastrar veículo na frota';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return this.marca.trim().length > 0;
  }

  loadProfissionais(): void {
    this.isLoadingProfissionais = true;
    this.profissionalService.findAll().subscribe({
      next: (data) => {
        this.profissionais = (data || []).filter(p => p.status);
        this.isLoadingProfissionais = false;
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais:', err);
        this.isLoadingProfissionais = false;
      }
    });
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const selectedProfissional = this.selectedProfissionalId
      ? this.profissionais.find(p => p.id === this.selectedProfissionalId) || null
      : null;

    const veiculo: Partial<Veiculo> = {
      marca: this.marca.trim(),
      placa: this.placa.trim() || undefined,
      ano: this.ano ?? undefined,
      profissional: selectedProfissional ? { id: selectedProfissional.id } as Profissional : null,
      status: this.status
    };

    const request$ = this.isEditMode && this.veiculoId
      ? this.veiculoService.update(this.veiculoId, veiculo)
      : this.veiculoService.create(veiculo);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar veículo:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

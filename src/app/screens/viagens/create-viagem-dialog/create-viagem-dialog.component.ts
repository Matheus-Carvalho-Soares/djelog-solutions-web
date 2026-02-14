import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViagemService } from '../../../services/viagem/viagem.service';
import { VeiculoService } from '../../../services/veiculo/veiculo.service';
import { ProfissionalService } from '../../../services/profissional/profissional.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { Viagem, ViagemStatus } from '../../../models/viagem.model';
import { Veiculo } from '../../../models/veiculo.model';
import { Profissional } from '../../../models/profissional.model';
import { Empresa } from '../../../models/empresa.model';

@Component({
  selector: 'app-create-viagem-dialog',
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
  templateUrl: './create-viagem-dialog.component.html',
  styleUrls: ['./create-viagem-dialog.component.css']
})
export class CreateViagemDialogComponent implements OnInit {
  // Form fields
  selectedVeiculoId: string | null = null;
  selectedProfissionalId: string | null = null;
  selectedEmpresaId: string | null = null;
  localizacaoFrete = '';
  valorFrete: number | null = null;
  comissao: number | null = null;
  abastecimento: number | null = null;
  despesas: number | null = null;
  dataInicio = '';
  dataFim = '';
  status: ViagemStatus = 'EM_ANDAMENTO';

  // Lists
  veiculos: Veiculo[] = [];
  profissionais: Profissional[] = [];
  empresas: Empresa[] = [];

  // Loading
  isLoadingData = false;
  isSaving = false;
  errorMessage = '';

  private viagemId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<CreateViagemDialogComponent>,
    private viagemService: ViagemService,
    private veiculoService: VeiculoService,
    private profissionalService: ProfissionalService,
    private empresaService: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data?: { viagem?: Viagem }
  ) {
    const viagem = data?.viagem as Viagem | undefined;
    if (viagem) {
      this.viagemId = viagem.id;
      this.selectedVeiculoId = viagem.veiculo?.id ?? null;
      this.selectedProfissionalId = viagem.profissional?.id ?? null;
      this.selectedEmpresaId = viagem.empresa?.id ?? null;
      this.localizacaoFrete = viagem.localizacaoFrete || '';
      this.valorFrete = viagem.valorFrete ?? null;
      this.comissao = viagem.comissao ?? null;
      this.abastecimento = viagem.abastecimento ?? null;
      this.despesas = viagem.despesas ?? null;
      this.dataInicio = viagem.dataInicio ? this.toDatetimeLocal(viagem.dataInicio) : '';
      this.dataFim = viagem.dataFim ? this.toDatetimeLocal(viagem.dataFim) : '';
      this.status = viagem.status || 'EM_ANDAMENTO';
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  get isEditMode(): boolean {
    return !!this.viagemId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'EDITAR VIAGEM' : 'NOVA VIAGEM';
  }

  get dialogSubtitle(): string {
    return this.isEditMode ? 'Atualizar dados da viagem' : 'Registrar nova viagem no sistema';
  }

  get actionLabel(): string {
    return this.isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR';
  }

  get isFormValid(): boolean {
    return (
      this.localizacaoFrete.trim().length > 0 &&
      this.valorFrete !== null && this.valorFrete >= 0 &&
      this.dataInicio.length > 0 &&
      this.selectedProfissionalId !== null &&
      this.selectedEmpresaId !== null &&
      this.selectedVeiculoId !== null
    );

  }

  loadData(): void {
    this.isLoadingData = true;
    let loaded = 0;
    const checkDone = () => { if (++loaded >= 3) this.isLoadingData = false; };

    this.veiculoService.findAll().subscribe({
      next: (data) => { this.veiculos = (data || []).filter(v => v.status); checkDone(); },
      error: () => checkDone()
    });

    this.profissionalService.findAll().subscribe({
      next: (data) => { this.profissionais = (data || []).filter(p => p.status); checkDone(); },
      error: () => checkDone()
    });

    this.empresaService.findAll().subscribe({
      next: (data) => { this.empresas = data || []; checkDone(); },
      error: () => checkDone()
    });
  }

  onVeiculoChange(): void {
    if (!this.selectedVeiculoId) return;
    const veiculo = this.veiculos.find(v => v.id === this.selectedVeiculoId);
    if (veiculo?.profissional?.id) {
      this.selectedProfissionalId = veiculo.profissional.id;
    }
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    const viagem: Partial<Viagem> = {
      veiculo: this.selectedVeiculoId ? { id: this.selectedVeiculoId } as Veiculo : null,
      profissional: this.selectedProfissionalId ? { id: this.selectedProfissionalId } as Profissional : null,
      empresa: this.selectedEmpresaId ? { id: this.selectedEmpresaId } as Empresa : null,
      localizacaoFrete: this.localizacaoFrete.trim(),
      valorFrete: this.valorFrete ?? 0,
      comissao: this.comissao ?? 0,
      abastecimento: this.abastecimento ?? 0,
      despesas: this.despesas ?? 0,
      dataInicio: this.dataInicio ? this.toIsoString(this.dataInicio) : '',
      dataFim: this.dataFim ? this.toIsoString(this.dataFim) : null,
      status: this.status
    };

    const request$ = this.isEditMode && this.viagemId
      ? this.viagemService.update(this.viagemId, viagem)
      : this.viagemService.create(viagem);

    request$.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.dialogRef.close(saved);
      },
      error: (err) => {
        console.error('Erro ao salvar viagem:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private toIsoString(dateValue: string): string {
    if (!dateValue) return '';
    return dateValue + 'T00:00:00';
  }
}

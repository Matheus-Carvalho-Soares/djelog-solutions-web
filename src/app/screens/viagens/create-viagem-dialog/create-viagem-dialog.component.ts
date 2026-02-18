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
import { DespesaService } from '../../../services/despesa/despesa.service';
import { Viagem, ViagemStatus, Despesa } from '../../../models/viagem.model';
import { Veiculo } from '../../../models/veiculo.model';
import { Profissional } from '../../../models/profissional.model';
import { Empresa } from '../../../models/empresa.model';

interface DespesaForm {
  id?: string;
  nome: string;
  descricao: string;
  valor: number | null;
}

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
  inicioFrete = '';
  fimFrete = '';
  valorFrete: number | null = null;
  comissao: number | null = null;
  dataInicio = '';
  dataFim = '';
  status: ViagemStatus = 'EM_ANDAMENTO';

  // Despesas list
  despesasList: DespesaForm[] = [];

  // Lists
  veiculos: Veiculo[] = [];
  profissionais: Profissional[] = [];
  empresas: Empresa[] = [];

  // Loading
  isLoadingData = false;
  isSaving = false;
  errorMessage = '';

  private viagemId: string | undefined;
  private existingDespesaIds: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateViagemDialogComponent>,
    private viagemService: ViagemService,
    private veiculoService: VeiculoService,
    private profissionalService: ProfissionalService,
    private empresaService: EmpresaService,
    private despesaService: DespesaService,
    @Inject(MAT_DIALOG_DATA) public data?: { viagem?: Viagem }
  ) {
    const viagem = data?.viagem as Viagem | undefined;
    if (viagem) {
      this.viagemId = viagem.id;
      this.selectedVeiculoId = viagem.veiculo?.id ?? null;
      this.selectedProfissionalId = viagem.profissional?.id ?? null;
      this.selectedEmpresaId = viagem.empresa?.id ?? null;
      this.inicioFrete = viagem.inicioFrete || '';
      this.fimFrete = viagem.fimFrete || '';
      this.valorFrete = viagem.valorFrete ?? null;
      this.comissao = viagem.comissao ?? null;
      this.dataInicio = viagem.dataInicio ? this.toDatetimeLocal(viagem.dataInicio) : '';
      this.dataFim = viagem.dataFim ? this.toDatetimeLocal(viagem.dataFim) : '';
      this.status = viagem.status || 'EM_ANDAMENTO';
    }
  }

  ngOnInit(): void {
    this.loadData();
    if (this.isEditMode && this.viagemId) {
      this.loadDespesas(this.viagemId);
    }
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
      this.inicioFrete.trim().length > 0 &&
      this.valorFrete !== null && this.valorFrete >= 0 &&
      this.dataInicio.length > 0 &&
      this.selectedProfissionalId !== null &&
      this.selectedEmpresaId !== null &&
      this.selectedVeiculoId !== null
    );
  }

  get totalDespesas(): number {
    return this.despesasList.reduce((sum, d) => sum + (d.valor || 0), 0);
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

  loadDespesas(viagemId: string): void {
    this.despesaService.findByViagemId(viagemId).subscribe({
      next: (despesas) => {
        this.despesasList = (despesas || []).map(d => ({
          id: d.id,
          nome: d.nome || '',
          descricao: d.descricao || '',
          valor: d.valor ?? null
        }));
        this.existingDespesaIds = this.despesasList.filter(d => d.id).map(d => d.id!);
      },
      error: () => { /* ignore, despesas list stays empty */ }
    });
  }

  onVeiculoChange(): void {
    if (!this.selectedVeiculoId) return;
    const veiculo = this.veiculos.find(v => v.id === this.selectedVeiculoId);
    if (veiculo?.profissional?.id) {
      this.selectedProfissionalId = veiculo.profissional.id;
    }
  }

  addDespesa(): void {
    this.despesasList.push({ nome: '', descricao: '', valor: null });
  }

  removeDespesa(index: number): void {
    const removed = this.despesasList.splice(index, 1)[0];
    // If it had an id (existing in DB), delete it from backend
    if (removed.id) {
      this.despesaService.delete(removed.id).subscribe();
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
      inicioFrete: this.inicioFrete.trim(),
      fimFrete: this.fimFrete.trim() || null,
      valorFrete: this.valorFrete ?? 0,
      comissao: this.comissao ?? 0,
      dataInicio: this.dataInicio ? this.toIsoString(this.dataInicio) : '',
      dataFim: this.dataFim ? this.toIsoString(this.dataFim) : null,
      status: this.status
    };

    const request$ = this.isEditMode && this.viagemId
      ? this.viagemService.update(this.viagemId, viagem)
      : this.viagemService.create(viagem);

    request$.subscribe({
      next: (saved) => {
        const viagemId = saved.id!;
        this.saveDespesas(viagemId, () => {
          this.isSaving = false;
          this.dialogRef.close(saved);
        });
      },
      error: (err) => {
        console.error('Erro ao salvar viagem:', err);
        this.isSaving = false;
        this.errorMessage = 'Falha ao salvar. Tente novamente.';
      }
    });
  }

  private saveDespesas(viagemId: string, onComplete: () => void): void {
    const despesasToSave = this.despesasList.filter(d => d.nome.trim() || d.valor);
    if (despesasToSave.length === 0) {
      onComplete();
      return;
    }

    let completed = 0;
    const checkDone = () => {
      if (++completed >= despesasToSave.length) onComplete();
    };

    despesasToSave.forEach(d => {
      const payload: Partial<Despesa> = {
        viagem: { id: viagemId },
        nome: d.nome.trim(),
        descricao: d.descricao.trim(),
        valor: d.valor ?? 0
      };

      if (d.id) {
        // Update existing despesa
        this.despesaService.update(d.id, payload).subscribe({
          next: () => checkDone(),
          error: () => checkDone()
        });
      } else {
        // Create new despesa
        this.despesaService.create(payload).subscribe({
          next: () => checkDone(),
          error: () => checkDone()
        });
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

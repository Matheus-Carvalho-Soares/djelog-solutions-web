import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Viagem, Despesa } from '../../../models/viagem.model';
import { DespesaService } from '../../../services/despesa/despesa.service';

@Component({
  selector: 'app-despesas-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './despesas-dialog.component.html',
  styleUrls: ['./despesas-dialog.component.css']
})
export class DespesasDialogComponent implements OnInit {
  viagem: Viagem;
  despesas: Despesa[] = [];
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<DespesasDialogComponent>,
    private despesaService: DespesaService,
    @Inject(MAT_DIALOG_DATA) public data: { viagem: Viagem }
  ) {
    this.viagem = data.viagem;
  }

  ngOnInit(): void {
    if (this.viagem.id) {
      this.despesaService.findByViagemId(this.viagem.id).subscribe({
        next: (despesas) => {
          this.despesas = despesas || [];
          this.isLoading = false;
        },
        error: () => {
          this.despesas = [];
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  get totalDespesas(): number {
    return this.despesas.reduce((sum, d) => sum + (d.valor || 0), 0) + this.comissaoValor || 0;
  }

  get comissaoValor(): number {
    return (this.viagem.valorFrete * this.viagem.comissao / 100) || 0;
  }

  get lucroLiquido(): number {
    return (this.viagem.valorFrete || 0)
      - this.comissaoValor
      - this.totalDespesas;
  }

  get isPositive(): boolean {
    return this.lucroLiquido >= 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  close(): void {
    this.dialogRef.close();
  }
}

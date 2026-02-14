import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Viagem } from '../../../models/viagem.model';

@Component({
  selector: 'app-despesas-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './despesas-dialog.component.html',
  styleUrls: ['./despesas-dialog.component.css']
})
export class DespesasDialogComponent {
  viagem: Viagem;

  constructor(
    public dialogRef: MatDialogRef<DespesasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { viagem: Viagem }
  ) {
    this.viagem = data.viagem;
  }

  get comissaoValor(): number {
    return ((this.viagem.valorFrete || 0) * (this.viagem.comissao || 0)) / 100;
  }

  get lucroLiquido(): number {
    return (this.viagem.valorFrete || 0)
      - this.comissaoValor
      - (this.viagem.abastecimento || 0)
      - (this.viagem.despesas || 0);
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

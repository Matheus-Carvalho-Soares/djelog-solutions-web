import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RelatorioService } from '../../../services/relatorio/relatorio.service';
import { ViagemRelatorioDTO } from '../../../models/relatorio.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-relatorio-por-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './relatorio-por-data.component.html',
  styleUrls: ['./relatorio-por-data.component.css']
})
export class RelatorioPorDataComponent {
  dataInicio = '';
  dataFim = '';
  dados: ViagemRelatorioDTO[] = [];
  isLoading = false;
  hasBuscado = false;

  displayedColumns: string[] = [
    'dataInicio', 'dataFim', 'status', 'profissionalNome', 'empresaNome',
    'veiculoMarca', 'veiculoPlaca', 'inicioFrete', 'fimFrete', 'valorFrete',
    'comissao', 'totalDespesas', 'lucroLiquido'
  ];

  constructor(
    private relatorioService: RelatorioService,
    private snackBar: MatSnackBar
  ) {}

  get isFormValid(): boolean {
    return !!this.dataInicio && !!this.dataFim;
  }

  buscar(): void {
    if (!this.isFormValid || this.isLoading) return;

    this.isLoading = true;
    this.hasBuscado = true;

    const inicio = new Date(this.dataInicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(this.dataFim);
    fim.setHours(23, 59, 59, 999);

    const isoInicio = inicio.toISOString();
    const isoFim = fim.toISOString();

    this.relatorioService.getRelatorioPorData(isoInicio, isoFim).subscribe({
      next: (dados) => {
        this.dados = dados || [];
        this.isLoading = false;
        if (this.dados.length === 0) {
          this.showMsg('Nenhum dado encontrado para o período selecionado');
        }
      },
      error: () => {
        this.dados = [];
        this.isLoading = false;
        this.showError('Erro ao buscar dados do relatório');
      }
    });
  }

  get totalFrete(): number {
    return this.dados.reduce((sum, d) => sum + (d.valorFrete || 0), 0);
  }

  get totalComissao(): number {
    return this.dados.reduce((sum, d) => sum + (d.comissao || 0), 0);
  }

  get totalDespesas(): number {
    return this.dados.reduce((sum, d) => sum + (d.totalDespesas || 0), 0);
  }

  get totalLucro(): number {
    return this.dados.reduce((sum, d) => sum + (d.lucroLiquido || 0), 0);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    if (value == null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDA': 'Concluída',
      'CANCELADA': 'Cancelada'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'EM_ANDAMENTO': 'status-andamento',
      'CONCLUIDA': 'status-concluida',
      'CANCELADA': 'status-cancelada'
    };
    return map[status] || '';
  }

  exportarExcel(): void {
    if (this.dados.length === 0) return;

    const headers = [
      'Data Início', 'Data Fim', 'Status', 'Profissional', 'Empresa',
      'Veículo Marca', 'Veículo Placa', 'Origem Frete', 'Destino Frete',
      'Valor Frete', 'Comissão', 'Total Despesas', 'Lucro Líquido'
    ];

    const rows = this.dados.map(d => [
      this.formatDate(d.dataInicio),
      this.formatDate(d.dataFim),
      this.getStatusLabel(d.status),
      d.profissionalNome || '',
      d.empresaNome || '',
      d.veiculoMarca || '',
      d.veiculoPlaca || '',
      d.inicioFrete || '',
      d.fimFrete || '',
      d.valorFrete ?? 0,
      d.comissao ?? 0,
      d.totalDespesas ?? 0,
      d.lucroLiquido ?? 0
    ]);

    const totalsRow = [
      '', '', '', '', '', '', '', '', 'TOTAIS',
      this.totalFrete,
      this.totalComissao,
      this.totalDespesas,
      this.totalLucro
    ];

    rows.push(totalsRow);

    const wsData = [headers, ...rows];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-ajustar largura das colunas
    const colWidths = headers.map((h, i) => {
      let maxLen = h.length;
      rows.forEach(row => {
        const cellVal = String(row[i] ?? '');
        if (cellVal.length > maxLen) maxLen = cellVal.length;
      });
      return { wch: maxLen + 4 };
    });
    ws['!cols'] = colWidths;

    // Formato numérico para colunas de valor (índices 8-12)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = 8; C <= 12; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].t = 'n';
          ws[cellRef].z = '#,##0.00';
        }
      }
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    XLSX.writeFile(wb, `relatorio-por-data_${this.dataInicio}_${this.dataFim}.xlsx`);

    this.showMsg('Relatório exportado com sucesso');
  }

  private showMsg(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000, panelClass: ['neon-snackbar'] });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Fechar', { duration: 5000, panelClass: ['neon-snackbar'] });
  }
}

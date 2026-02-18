import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViagemService } from '../../services/viagem/viagem.service';
import { Viagem, ViagemStatus } from '../../models/viagem.model';
import { CreateViagemDialogComponent } from './create-viagem-dialog/create-viagem-dialog.component';
import { DespesasDialogComponent } from './despesas-dialog/despesas-dialog.component';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './viagens.component.html',
  styleUrls: ['./viagens.component.css']
})
export class ViagensComponent implements OnInit {
  viagens: Viagem[] = [];
  filteredViagens: Viagem[] = [];
  displayedColumns: string[] = ['profissional', 'empresa', 'frete', 'valorFrete', 'status', 'dataInicio', 'dataFim', 'acoes'];
  isLoading = true;
  hasError = false;

  // Filters
  filterFrete = '';
  filterEmpresa = '';
  filterStatus: 'todos' | ViagemStatus = 'todos';
  filtersVisible = false;

  constructor(
    private viagemService: ViagemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadViagens();
  }

  loadViagens(): void {
    this.isLoading = true;
    this.hasError = false;
    this.viagemService.findAll().subscribe({
      next: (data) => {
        this.viagens = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar viagens:', err);
        this.viagens = [];
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateViagemDialogComponent, {
      width: '620px',
      maxHeight: '90vh',
      panelClass: 'neon-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: Viagem | undefined) => {
      if (result) {
        this.loadViagens();
        this.snackBar.open('Viagem criada com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  openEditDialog(viagem: Viagem): void {
    const dialogRef = this.dialog.open(CreateViagemDialogComponent, {
      width: '620px',
      maxHeight: '90vh',
      panelClass: 'neon-dialog',
      disableClose: false,
      data: { viagem }
    });

    dialogRef.afterClosed().subscribe((result: Viagem | undefined) => {
      if (result) {
        this.loadViagens();
        this.snackBar.open('Viagem atualizada com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  openDespesasDialog(viagem: Viagem): void {
    this.dialog.open(DespesasDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false,
      data: { viagem }
    });
  }

  getStatusLabel(status: ViagemStatus): string {
    const labels: Record<ViagemStatus, string> = {
      'EM_ANDAMENTO': 'EM ANDAMENTO',
      'CONCLUIDA': 'CONCLUÍDA',
      'CANCELADA': 'CANCELADA'
    };
    return labels[status] || status;
  }

  getStatusClass(status: ViagemStatus): string {
    const classes: Record<ViagemStatus, string> = {
      'EM_ANDAMENTO': 'em-andamento',
      'CONCLUIDA': 'concluida',
      'CANCELADA': 'cancelada'
    };
    return classes[status] || '';
  }

  formatCurrency(value: number): string {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  applyFilters(): void {
    let result = [...this.viagens];

    if (this.filterFrete.trim()) {
      const term = this.filterFrete.trim().toLowerCase();
      result = result.filter(v => v.inicioFrete?.toLowerCase().includes(term) || v.fimFrete?.toLowerCase().includes(term));
    }

    if (this.filterEmpresa.trim()) {
      const term = this.filterEmpresa.trim().toLowerCase();
      result = result.filter(v => v.empresa?.nome?.toLowerCase().includes(term));
    }

    if (this.filterStatus !== 'todos') {
      result = result.filter(v => v.status === this.filterStatus);
    }

    this.filteredViagens = result;
  }

  clearFilters(): void {
    this.filterFrete = '';
    this.filterEmpresa = '';
    this.filterStatus = 'todos';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.filterFrete.trim() !== '' || this.filterEmpresa.trim() !== '' || this.filterStatus !== 'todos';
  }
}

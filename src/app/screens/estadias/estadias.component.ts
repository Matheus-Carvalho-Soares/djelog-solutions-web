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
import { EstadiaService } from '../../services/estadia/estadia.service';
import { Estadia } from '../../models/estadia.model';
import { Viagem } from '../../models/viagem.model';
import { CreateEstadiaDialogComponent } from './create-estadia-dialog/create-estadia-dialog.component';

@Component({
  selector: 'app-estadias',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './estadias.component.html',
  styleUrls: ['./estadias.component.css']
})
export class EstadiasComponent implements OnInit {
  estadias: Estadia[] = [];
  filteredEstadias: Estadia[] = [];
  displayedColumns: string[] = ['viagem', 'descricao', 'valor', 'acoes'];
  isLoading = true;
  hasError = false;

  filterDescricao = '';
  filterViagem = '';
  filtersVisible = false;

  constructor(
    private estadiaService: EstadiaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadEstadias(); }

  loadEstadias(): void {
    this.isLoading = true;
    this.hasError = false;
    this.estadiaService.findAll().subscribe({
      next: (data) => { this.estadias = data || []; this.applyFilters(); this.isLoading = false; },
      error: (err) => { console.error('Erro ao carregar estadias:', err); this.estadias = []; this.isLoading = false; this.hasError = true; }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEstadiaDialogComponent, {
      width: '620px', maxHeight: '90vh', panelClass: 'neon-dialog', disableClose: false
    });
    dialogRef.afterClosed().subscribe((result: Estadia | undefined) => {
      if (result) { this.loadEstadias(); this.snackBar.open('Estadia criada com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' }); }
    });
  }

  openEditDialog(estadia: Estadia): void {
    const dialogRef = this.dialog.open(CreateEstadiaDialogComponent, {
      width: '620px', maxHeight: '90vh', panelClass: 'neon-dialog', disableClose: false, data: { estadia }
    });
    dialogRef.afterClosed().subscribe((result: Estadia | undefined) => {
      if (result) { this.loadEstadias(); this.snackBar.open('Estadia atualizada com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' }); }
    });
  }

  confirmDelete(estadia: Estadia): void {
    if (!estadia.id) return;
    this.estadiaService.delete(estadia.id).subscribe({
      next: () => {
        this.loadEstadias();
        this.snackBar.open('Estadia excluída com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' });
      },
      error: (err) => {
        console.error('Erro ao excluir estadia:', err);
        this.snackBar.open('Erro ao excluir estadia.', 'OK', { duration: 4000, panelClass: 'neon-snackbar' });
      }
    });
  }

  getViagemLabel(viagem: any): string {
    if (!viagem) return '—';
    const parts: string[] = [];
    if (viagem.inicioFrete) parts.push(viagem.inicioFrete);
    if (viagem.fimFrete) parts.push('→ ' + viagem.fimFrete);
    return parts.length > 0 ? parts.join(' ') : (viagem.id ? viagem.id.substring(0, 8) + '...' : '—');
  }

  formatCurrency(value: number): string { return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

  toggleFilters(): void { this.filtersVisible = !this.filtersVisible; }

  applyFilters(): void {
    let result = [...this.estadias];
    if (this.filterDescricao.trim()) {
      const term = this.filterDescricao.trim().toLowerCase();
      result = result.filter(e => e.descricao?.toLowerCase().includes(term));
    }
    if (this.filterViagem.trim()) {
      const term = this.filterViagem.trim().toLowerCase();
      result = result.filter(e => {
        const v = e.viagem as Viagem;
        return v?.inicioFrete?.toLowerCase().includes(term) || v?.fimFrete?.toLowerCase().includes(term);
      });
    }
    this.filteredEstadias = result;
  }

  clearFilters(): void { this.filterDescricao = ''; this.filterViagem = ''; this.applyFilters(); }
  get hasActiveFilters(): boolean { return this.filterDescricao.trim() !== '' || this.filterViagem.trim() !== ''; }
}

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
import { ViagemComissionadaService } from '../../services/viagem-comissionada/viagem-comissionada.service';
import { ViagemComissionada } from '../../models/viagem-comissionada.model';
import { CreateViagemComissionadaDialogComponent } from './create-viagem-comissionada-dialog/create-viagem-comissionada-dialog.component';

@Component({
  selector: 'app-viagens-comissionadas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './viagens-comissionadas.component.html',
  styleUrls: ['./viagens-comissionadas.component.css']
})
export class ViagensComissionadasComponent implements OnInit {
  viagens: ViagemComissionada[] = [];
  filteredViagens: ViagemComissionada[] = [];
  displayedColumns: string[] = ['inicioFrete', 'fimFrete', 'valor', 'comissao', 'descricao', 'acoes'];
  isLoading = true;
  hasError = false;

  filterInicioFrete = '';
  filterDescricao = '';
  filtersVisible = false;

  constructor(
    private viagemComissionadaService: ViagemComissionadaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadViagens(); }

  loadViagens(): void {
    this.isLoading = true;
    this.hasError = false;
    this.viagemComissionadaService.findAll().subscribe({
      next: (data) => { this.viagens = data || []; this.applyFilters(); this.isLoading = false; },
      error: (err) => { console.error('Erro ao carregar viagens comissionadas:', err); this.viagens = []; this.isLoading = false; this.hasError = true; }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateViagemComissionadaDialogComponent, {
      width: '620px', maxHeight: '90vh', panelClass: 'neon-dialog', disableClose: false
    });
    dialogRef.afterClosed().subscribe((result: ViagemComissionada | undefined) => {
      if (result) { this.loadViagens(); this.snackBar.open('Viagem comissionada criada com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' }); }
    });
  }

  openEditDialog(viagem: ViagemComissionada): void {
    const dialogRef = this.dialog.open(CreateViagemComissionadaDialogComponent, {
      width: '620px', maxHeight: '90vh', panelClass: 'neon-dialog', disableClose: false, data: { viagem }
    });
    dialogRef.afterClosed().subscribe((result: ViagemComissionada | undefined) => {
      if (result) { this.loadViagens(); this.snackBar.open('Viagem comissionada atualizada com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' }); }
    });
  }

  confirmDelete(viagem: ViagemComissionada): void {
    if (!viagem.id) return;
    this.viagemComissionadaService.delete(viagem.id).subscribe({
      next: () => {
        this.loadViagens();
        this.snackBar.open('Viagem comissionada excluída com sucesso!', 'OK', { duration: 4000, panelClass: 'neon-snackbar' });
      },
      error: (err) => {
        console.error('Erro ao excluir viagem comissionada:', err);
        this.snackBar.open('Erro ao excluir viagem comissionada.', 'OK', { duration: 4000, panelClass: 'neon-snackbar' });
      }
    });
  }

  formatCurrency(value: number): string { return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

  toggleFilters(): void { this.filtersVisible = !this.filtersVisible; }

  applyFilters(): void {
    let result = [...this.viagens];
    if (this.filterInicioFrete.trim()) {
      const term = this.filterInicioFrete.trim().toLowerCase();
      result = result.filter(v => v.inicioFrete?.toLowerCase().includes(term) || v.fimFrete?.toLowerCase().includes(term));
    }
    if (this.filterDescricao.trim()) {
      const term = this.filterDescricao.trim().toLowerCase();
      result = result.filter(v => v.descricao?.toLowerCase().includes(term));
    }
    this.filteredViagens = result;
  }

  clearFilters(): void { this.filterInicioFrete = ''; this.filterDescricao = ''; this.applyFilters(); }
  get hasActiveFilters(): boolean { return this.filterInicioFrete.trim() !== '' || this.filterDescricao.trim() !== ''; }
}

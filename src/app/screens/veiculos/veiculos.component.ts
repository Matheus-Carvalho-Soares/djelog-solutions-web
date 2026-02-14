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
import { VeiculoService } from '../../services/veiculo/veiculo.service';
import { Veiculo } from '../../models/veiculo.model';
import { CreateVeiculoDialogComponent } from './create-veiculo-dialog/create-veiculo-dialog.component';

@Component({
  selector: 'app-veiculos',
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
  templateUrl: './veiculos.component.html',
  styleUrls: ['./veiculos.component.css']
})
export class VeiculosComponent implements OnInit {
  veiculos: Veiculo[] = [];
  filteredVeiculos: Veiculo[] = [];
  displayedColumns: string[] = ['marca', 'placa', 'ano', 'profissional', 'status', 'acoes'];
  isLoading = true;
  hasError = false;

  // Filters
  filterMarca = '';
  filterAno = '';
  filterStatus: 'todos' | 'ativo' | 'inativo' = 'todos';
  filtersVisible = false;

  constructor(
    private veiculoService: VeiculoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVeiculos();
  }

  loadVeiculos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.veiculoService.findAll().subscribe({
      next: (data) => {
        this.veiculos = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.veiculos = [];
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateVeiculoDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: Veiculo | undefined) => {
      if (result) {
        this.loadVeiculos();
        this.snackBar.open('Veículo criado com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  openEditDialog(veiculo: Veiculo): void {
    const dialogRef = this.dialog.open(CreateVeiculoDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false,
      data: { veiculo }
    });

    dialogRef.afterClosed().subscribe((result: Veiculo | undefined) => {
      if (result) {
        this.loadVeiculos();
        this.snackBar.open('Veículo atualizado com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  getStatusLabel(status: boolean): string {
    return status ? 'ATIVO' : 'INATIVO';
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  applyFilters(): void {
    let result = [...this.veiculos];

    if (this.filterMarca.trim()) {
      const term = this.filterMarca.trim().toLowerCase();
      result = result.filter(v => v.marca?.toLowerCase().includes(term));
    }

    if (this.filterAno.trim()) {
      const term = this.filterAno.trim();
      result = result.filter(v => v.ano?.toString().includes(term));
    }

    if (this.filterStatus !== 'todos') {
      const isActive = this.filterStatus === 'ativo';
      result = result.filter(v => v.status === isActive);
    }

    this.filteredVeiculos = result;
  }

  clearFilters(): void {
    this.filterMarca = '';
    this.filterAno = '';
    this.filterStatus = 'todos';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.filterMarca.trim() !== '' || this.filterAno.trim() !== '' || this.filterStatus !== 'todos';
  }
}

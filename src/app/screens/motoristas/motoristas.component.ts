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
import { ProfissionalService } from '../../services/profissional/profissional.service';
import { Profissional } from '../../models/profissional.model';
import { CreateMotoristaDialogComponent } from './create-motorista-dialog/create-motorista-dialog.component';

@Component({
  selector: 'app-motoristas',
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
  templateUrl: './motoristas.component.html',
  styleUrls: ['./motoristas.component.css']
})
export class MotoristasComponent implements OnInit {
  motoristas: Profissional[] = [];
  filteredMotoristas: Profissional[] = [];
  displayedColumns: string[] = ['nome', 'telefone', 'status', 'acoes'];
  isLoading = true;
  hasError = false;

  // Filters
  filterNome = '';
  filterTelefone = '';
  filterStatus: 'todos' | 'ativo' | 'inativo' = 'todos';
  filtersVisible = false;

  constructor(
    private profissionalService: ProfissionalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMotoristas();
  }

  loadMotoristas(): void {
    this.isLoading = true;
    this.hasError = false;
    this.profissionalService.findAll().subscribe({
      next: (data) => {
        this.motoristas = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar motoristas:', err);
        this.motoristas = [];
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateMotoristaDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: Profissional | undefined) => {
      if (result) {
        this.motoristas = [...this.motoristas, result];
        this.applyFilters();
        this.snackBar.open('Motorista criado com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  openEditDialog(motorista: Profissional): void {
    const dialogRef = this.dialog.open(CreateMotoristaDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false,
      data: { profissional: motorista }
    });

    dialogRef.afterClosed().subscribe((result: Profissional | undefined) => {
      if (result) {
        this.motoristas = this.motoristas.map((item) =>
          item.id === result.id ? result : item
        );
        this.applyFilters();
        this.snackBar.open('Motorista atualizado com sucesso!', 'OK', {
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
    let result = [...this.motoristas];

    if (this.filterNome.trim()) {
      const term = this.filterNome.trim().toLowerCase();
      result = result.filter(m => m.nome?.toLowerCase().includes(term));
    }

    if (this.filterTelefone.trim()) {
      const term = this.filterTelefone.trim().toLowerCase();
      result = result.filter(m => m.telefone?.toLowerCase().includes(term));
    }

    if (this.filterStatus !== 'todos') {
      const isActive = this.filterStatus === 'ativo';
      result = result.filter(m => m.status === isActive);
    }

    this.filteredMotoristas = result;
  }

  clearFilters(): void {
    this.filterNome = '';
    this.filterTelefone = '';
    this.filterStatus = 'todos';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.filterNome.trim() !== '' || this.filterTelefone.trim() !== '' || this.filterStatus !== 'todos';
  }
}

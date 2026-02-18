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
import { EmpresaService } from '../../services/empresa/empresa.service';
import { Empresa } from '../../models/empresa.model';
import { CreateEmpresaDialogComponent } from './create-empresa-dialog/create-empresa-dialog.component';

@Component({
  selector: 'app-empresas',
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
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  filteredEmpresas: Empresa[] = [];
  displayedColumns: string[] = ['nome', 'descricao', 'nomeContato', 'telefoneContato', 'emailContato', 'acoes'];
  isLoading = true;
  hasError = false;

  // Filters
  filterNome = '';
  filterDescricao = '';
  filtersVisible = false;

  constructor(
    private empresaService: EmpresaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmpresas();
  }

  loadEmpresas(): void {
    this.isLoading = true;
    this.hasError = false;
    this.empresaService.findAll().subscribe({
      next: (data) => {
        this.empresas = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empresas:', err);
        this.empresas = [];
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEmpresaDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: Empresa | undefined) => {
      if (result) {
        this.loadEmpresas();
        this.snackBar.open('Empresa criada com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  openEditDialog(empresa: Empresa): void {
    const dialogRef = this.dialog.open(CreateEmpresaDialogComponent, {
      width: '520px',
      panelClass: 'neon-dialog',
      disableClose: false,
      data: { empresa }
    });

    dialogRef.afterClosed().subscribe((result: Empresa | undefined) => {
      if (result) {
        this.loadEmpresas();
        this.snackBar.open('Empresa atualizada com sucesso!', 'OK', {
          duration: 4000,
          panelClass: 'neon-snackbar'
        });
      }
    });
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  applyFilters(): void {
    let result = [...this.empresas];

    if (this.filterNome.trim()) {
      const term = this.filterNome.trim().toLowerCase();
      result = result.filter(e => e.nome?.toLowerCase().includes(term));
    }

    if (this.filterDescricao.trim()) {
      const term = this.filterDescricao.trim().toLowerCase();
      result = result.filter(e => e.descricao?.toLowerCase().includes(term));
    }

    this.filteredEmpresas = result;
  }

  clearFilters(): void {
    this.filterNome = '';
    this.filterDescricao = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.filterNome.trim() !== '' || this.filterDescricao.trim() !== '';
  }
}

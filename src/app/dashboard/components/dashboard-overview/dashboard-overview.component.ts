import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FinancialCardsComponent } from '../../components/financial-cards/financial-cards.component';
import { PerformanceChartComponent } from '../../components/performance-chart/performance-chart.component';
import { VehicleTableComponent } from '../../components/vehicle-table/vehicle-table.component';
import { RecentTripsComponent } from '../../components/recent-trips/recent-trips.component';
import {
  DashboardDataService,
  FinancialSummary,
  MonthlyPerformance,
  WeeklyPerformance,
  VehiclePerformance,
  RecentTrip
} from '../../../services/dashboard/dashboard-data.service';
import { Viagem } from '../../../models/viagem.model';
import { Veiculo } from '../../../models/veiculo.model';
import { Profissional } from '../../../models/profissional.model';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FinancialCardsComponent,
    PerformanceChartComponent,
    VehicleTableComponent,
    RecentTripsComponent
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit {
  financialSummary: FinancialSummary | null = null;
  monthlyPerformance: MonthlyPerformance | null = null;
  weeklyPerformance: WeeklyPerformance | null = null;
  vehiclePerformance: VehiclePerformance[] = [];
  recentTrips: RecentTrip[] = [];

  isLoading = true;
  hasError = false;
  isEmpty = false;

  // Raw data for filtering
  allViagens: Viagem[] = [];
  allVeiculos: Veiculo[] = [];

  // Filter options
  veiculoOptions: Veiculo[] = [];
  profissionalOptions: Profissional[] = [];

  // Selected filters
  selectedVeiculoId = '';
  selectedProfissionalId = '';

  constructor(private dataService: DashboardDataService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;

    this.dataService.loadDashboard().subscribe({
      next: (data) => {
        this.allViagens = data.allViagens;
        this.allVeiculos = data.allVeiculos;

        this.financialSummary = data.financialSummary;
        this.monthlyPerformance = data.monthlyPerformance;
        this.weeklyPerformance = data.weeklyPerformance;
        this.vehiclePerformance = data.vehiclePerformance;
        this.recentTrips = data.recentTrips;

        this.isEmpty = data.allViagens.length === 0;
        this.buildFilterOptions();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  buildFilterOptions(): void {
    // Veículos from veiculoService.findAll()
    this.veiculoOptions = this.allVeiculos;

    // Profissionais extracted from viagens
    const profMap = new Map<string, Profissional>();
    this.allViagens.forEach(v => {
      if (v.profissional?.id) {
        profMap.set(v.profissional.id, v.profissional);
      }
    });
    this.profissionalOptions = Array.from(profMap.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }

  applyFilters(): void {
    let filtered = [...this.allViagens];

    if (this.selectedVeiculoId) {
      filtered = filtered.filter(v => v.veiculo?.id === this.selectedVeiculoId);
    }

    if (this.selectedProfissionalId) {
      filtered = filtered.filter(v => v.profissional?.id === this.selectedProfissionalId);
    }

    const computed = this.dataService.buildDashboard(filtered, this.allVeiculos);
    this.financialSummary = computed.financialSummary;
    this.monthlyPerformance = computed.monthlyPerformance;
    this.weeklyPerformance = computed.weeklyPerformance;
    this.vehiclePerformance = computed.vehiclePerformance;
    this.recentTrips = computed.recentTrips;
  }

  clearFilters(): void {
    this.selectedVeiculoId = '';
    this.selectedProfissionalId = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.selectedVeiculoId || !!this.selectedProfissionalId;
  }
}

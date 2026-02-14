import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FinancialCardsComponent } from '../../components/financial-cards/financial-cards.component';
import { PerformanceChartComponent } from '../../components/performance-chart/performance-chart.component';
import { VehicleTableComponent } from '../../components/vehicle-table/vehicle-table.component';
import { RecentTripsComponent } from '../../components/recent-trips/recent-trips.component';
import {
  DashboardDataService,
  FinancialSummary,
  MonthlyPerformance,
  VehiclePerformance,
  RecentTrip
} from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
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
  vehiclePerformance: VehiclePerformance[] = [];
  recentTrips: RecentTrip[] = [];

  isLoading = true;
  hasError = false;

  constructor(private dataService: DashboardDataService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dataService.loadDashboard().subscribe({
      next: (data) => {
        this.financialSummary = data.financialSummary;
        this.monthlyPerformance = data.monthlyPerformance;
        this.vehiclePerformance = data.vehiclePerformance;
        this.recentTrips = data.recentTrips;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}

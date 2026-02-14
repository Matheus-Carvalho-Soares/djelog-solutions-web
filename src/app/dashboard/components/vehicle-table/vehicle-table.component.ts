import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { VehiclePerformance } from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-vehicle-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './vehicle-table.component.html',
  styleUrls: ['./vehicle-table.component.css']
})
export class VehicleTableComponent {
  @Input({ required: true }) vehicles: VehiclePerformance[] = [];

  displayedColumns: string[] = ['veiculo', 'viagens', 'receita', 'despesas', 'lucro', 'performance'];

  Math = Math;

  getPerformanceClass(percentual: number): string {
    if (percentual >= 30) return 'excellent';
    if (percentual >= 15) return 'good';
    if (percentual >= 0) return 'average';
    return 'poor';
  }
}

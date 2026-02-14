import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RecentTrip } from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  templateUrl: './recent-trips.component.html',
  styleUrls: ['./recent-trips.component.css']
})
export class RecentTripsComponent {
  @Input({ required: true }) trips: RecentTrip[] = [];

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'EM_ANDAMENTO': 'active',
      'CONCLUIDA': 'completed',
      'CANCELADA': 'cancelled'
    };
    return statusMap[status] || 'active';
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      'EM_ANDAMENTO': 'EM ANDAMENTO',
      'CONCLUIDA': 'CONCLUÍDA',
      'CANCELADA': 'CANCELADA'
    };
    return labelMap[status] || status;
  }

  getLucro(trip: RecentTrip): number {
    return trip.lucro ?? trip.receita - trip.despesa;
  }
}

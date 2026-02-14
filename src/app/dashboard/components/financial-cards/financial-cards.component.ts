import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FinancialSummary } from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-financial-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './financial-cards.component.html',
  styleUrl: './financial-cards.component.css'
})
export class FinancialCardsComponent {
  @Input({ required: true }) summary!: FinancialSummary;

  get lucroClass(): string {
    return this.summary.lucroLiquido >= 0 ? 'positive' : 'negative';
  }

  getPercentageProfit(): string {
    if (this.summary.totalReceita === 0) return '0.0';
    const percentage = (this.summary.lucroLiquido / this.summary.totalReceita) * 100;
    return percentage.toFixed(1);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { FinancialSummary, ComissaoComissionadaSummary } from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-financial-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './financial-cards.component.html',
  styleUrl: './financial-cards.component.css',
  animations: [
    trigger('cardSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }))
      ])
    ])
  ]
})
export class FinancialCardsComponent {
  @Input({ required: true }) summary!: FinancialSummary;
  @Input() comissaoComissionada: ComissaoComissionadaSummary | null = null;

  get lucroClass(): string {
    return this.summary.lucroLiquido >= 0 ? 'positive' : 'negative';
  }

  getPercentageProfit(): string {
    if (this.summary.totalReceita === 0) return '0.0';
    const percentage = (this.summary.lucroLiquido / this.summary.totalReceita) * 100;
    return percentage.toFixed(1);
  }
}

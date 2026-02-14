import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MonthlyPerformance } from '../../../services/dashboard/dashboard-data.service';

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule],
  templateUrl: './performance-chart.component.html',
  styleUrl: './performance-chart.component.css'
})
export class PerformanceChartComponent implements OnChanges {
  @Input({ required: true }) performance!: MonthlyPerformance;

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: 'rgba(251, 191, 36, 0.9)',
          font: {
            family: 'Rajdhani, monospace',
            size: 12,
            weight: 600
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 20, 25, 0.95)',
        titleColor: '#fbbf24',
        bodyColor: '#ffffff',
        borderColor: 'rgba(251, 191, 36, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          family: 'Rajdhani, monospace',
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: 'IBM Plex Sans, sans-serif',
          size: 13
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(251, 191, 36, 0.7)',
          font: {
            family: 'Rajdhani, monospace',
            size: 11,
            weight: 600
          }
        },
        border: {
          color: 'rgba(251, 191, 36, 0.2)'
        }
      },
      y: {
        grid: {
          color: 'rgba(251, 191, 36, 0.08)',
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(251, 191, 36, 0.7)',
          font: {
            family: 'Rajdhani, monospace',
            size: 11,
            weight: 600
          },
          callback: function(value) {
            return 'R$ ' + (value as number).toLocaleString('pt-BR');
          }
        },
        border: {
          color: 'rgba(251, 191, 36, 0.2)'
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['performance'] && this.performance) {
      this.barChartData = {
        labels: this.performance.labels,
        datasets: [
          {
            data: this.performance.receitas,
            label: 'RECEITA',
            backgroundColor: 'rgba(251, 191, 36, 0.85)',
            borderColor: '#fbbf24',
            borderWidth: 1,
            borderRadius: 2,
            hoverBackgroundColor: '#fbbf24',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          },
          {
            data: this.performance.despesas,
            label: 'DESPESA',
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            borderRadius: 2,
            hoverBackgroundColor: '#f59e0b',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }
        ]
      };
    }
  }
}

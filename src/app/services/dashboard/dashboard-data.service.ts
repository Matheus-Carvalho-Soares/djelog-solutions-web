import { Injectable } from '@angular/core';
import { forkJoin, Observable, map, catchError, of } from 'rxjs';
import { Veiculo } from '../../models/veiculo.model';
import { Viagem, Despesa } from '../../models/viagem.model';
import { ViagemService } from '../viagem/viagem.service';
import { VeiculoService } from '../veiculo/veiculo.service';
import { DespesaService } from '../despesa/despesa.service';

export interface FinancialSummary {
  totalReceita: number;
  totalDespesa: number;
  lucroLiquido: number;
  viagensAtivas: number;
  viagensPrejuizo: number;
}

export type ChartViewMode = 'mensal' | 'semanal';

export interface MonthlyPerformance {
  labels: string[];
  receitas: number[];
  despesas: number[];
}

export interface WeeklyPerformance {
  labels: string[];
  receitas: number[];
  despesas: number[];
}

export interface VehiclePerformance {
  placa: string;
  marca: string;
  totalViagens: number;
  receita: number;
  despesas: number;
  lucro: number;
  percentualLucro: number;
}

export interface RecentTrip {
  id: string;
  localizacao: string;
  motorista: string;
  veiculo: string;
  receita: number;
  despesa: number;
  lucro: number;
  status: string;
  inicio: Date;
  inicioFrete: string;
  fimFrete: string;
}

export interface DashboardData {
  financialSummary: FinancialSummary;
  monthlyPerformance: MonthlyPerformance;
  weeklyPerformance: WeeklyPerformance;
  vehiclePerformance: VehiclePerformance[];
  recentTrips: RecentTrip[];
  allViagens: Viagem[];
  allVeiculos: Veiculo[];
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {

  /** Map de viagemId → total de despesas (carregado no loadDashboard) */
  private despesasPorViagem = new Map<string, number>();

  constructor(
    private viagemService: ViagemService,
    private veiculoService: VeiculoService,
    private despesaService: DespesaService
  ) {}

  loadDashboard(): Observable<DashboardData> {
    return forkJoin({
      viagens: this.viagemService.findAll().pipe(catchError(() => of([] as Viagem[]))),
      veiculos: this.veiculoService.findAll().pipe(catchError(() => of([] as Veiculo[]))),
      despesas: this.despesaService.findAll().pipe(catchError(() => of([] as Despesa[])))
    }).pipe(
      map(({ viagens, veiculos, despesas }) => {
        // Normalize nulls (204 No Content) to empty arrays
        const safeViagens = viagens ?? [];
        const safeVeiculos = veiculos ?? [];
        const safeDespesas = despesas ?? [];

        // Agrupa despesas por viagem
        this.despesasPorViagem = new Map<string, number>();
        safeDespesas.forEach(d => {
          const vid = d.viagem?.id;
          if (vid) {
            this.despesasPorViagem.set(vid, (this.despesasPorViagem.get(vid) || 0) + (d.valor || 0));
          }
        });

        return {
          ...this.buildDashboard(safeViagens, safeVeiculos),
          allViagens: safeViagens,
          allVeiculos: safeVeiculos
        };
      })
    );
  }

  buildDashboard(viagens: Viagem[], veiculos: Veiculo[]): Omit<DashboardData, 'allViagens' | 'allVeiculos'> {
    return {
      financialSummary: this.buildFinancialSummary(viagens),
      monthlyPerformance: this.buildMonthlyPerformance(viagens),
      weeklyPerformance: this.buildWeeklyPerformance(viagens),
      vehiclePerformance: this.buildVehiclePerformance(viagens, veiculos),
      recentTrips: this.buildRecentTrips(viagens)
    };
  }

  // --------------- FINANCIAL SUMMARY ---------------

  private buildFinancialSummary(viagens: Viagem[]): FinancialSummary {
    const totalReceita = viagens.reduce((acc, v) => acc + v.valorFrete, 0);
    const totalDespesa = viagens.reduce((acc, v) => acc + this.getTripCost(v), 0);
    const viagensAtivas = viagens.filter(v => v.status === 'EM_ANDAMENTO').length;
    const viagensPrejuizo = viagens.filter(v => this.getTripProfit(v) < 0).length;

    return {
      totalReceita,
      totalDespesa,
      lucroLiquido: totalReceita - totalDespesa,
      viagensAtivas,
      viagensPrejuizo
    };
  }

  // --------------- MONTHLY PERFORMANCE ---------------

  private buildMonthlyPerformance(viagens: Viagem[]): MonthlyPerformance {
    const { labels, monthKeys } = this.getLastSixMonths();
    const receitas = monthKeys.map(key => this.sumByMonth(viagens, key, 'receita'));
    const despesas = monthKeys.map(key => this.sumByMonth(viagens, key, 'despesa'));
    return { labels, receitas, despesas };
  }

  // --------------- WEEKLY PERFORMANCE ---------------

  private buildWeeklyPerformance(viagens: Viagem[]): WeeklyPerformance {
    const { labels, weekKeys } = this.getLastEightWeeks();
    const receitas = weekKeys.map(key => this.sumByWeek(viagens, key, 'receita'));
    const despesas = weekKeys.map(key => this.sumByWeek(viagens, key, 'despesa'));
    return { labels, receitas, despesas };
  }

  // --------------- VEHICLE PERFORMANCE ---------------

  private buildVehiclePerformance(viagens: Viagem[], veiculos: Veiculo[]): VehiclePerformance[] {
    return veiculos.map(veiculo => {
      const trips = viagens.filter(v => v.veiculo?.id === veiculo.id);
      const receita = trips.reduce((acc, v) => acc + v.valorFrete, 0);
      const despesas = trips.reduce((acc, v) => acc + this.getTripCost(v), 0);
      const lucro = receita - despesas;
      const percentualLucro = receita > 0 ? parseFloat(((lucro / receita) * 100).toFixed(1)) : 0;

      return {
        placa: veiculo.placa || '—',
        marca: veiculo.marca,
        totalViagens: trips.length,
        receita,
        despesas,
        lucro,
        percentualLucro
      };
    }).filter(vp => vp.totalViagens > 0);
  }

  // --------------- RECENT TRIPS ---------------

  private buildRecentTrips(viagens: Viagem[]): RecentTrip[] {
    return [...viagens]
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .slice(0, 6)
      .map(v => {
        const receita = v.valorFrete;
        const despesa = this.getTripCost(v);
        return {
          id: v.id ?? '-',
          localizacao: `${v.inicioFrete || ''} → ${v.fimFrete || ''}`,
          inicioFrete: v.inicioFrete || '',
          fimFrete: v.fimFrete || '',
          motorista: v.profissional?.nome ?? 'Não informado',
          veiculo: v.veiculo?.marca ?? 'Não informado',
          receita,
          despesa,
          lucro: receita - despesa,
          status: v.status,
          inicio: new Date(v.dataInicio)
        };
      });
  }

  // --------------- HELPERS ---------------

  /** Comissão é porcentagem do valorFrete + despesas da viagem */
  private getTripCost(viagem: Viagem): number {
    const comissaoValor = (viagem.valorFrete * (viagem.comissao || 0)) / 100;
    const despesasViagem = this.despesasPorViagem.get(viagem.id || '') || 0;
    return comissaoValor + despesasViagem;
  }

  private getTripProfit(viagem: Viagem): number {
    return viagem.valorFrete - this.getTripCost(viagem);
  }

  private getLastSixMonths(): { labels: string[]; monthKeys: string[] } {
    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const labels: string[] = [];
    const monthKeys: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = formatter.format(date);
      labels.push(label.charAt(0).toUpperCase() + label.slice(1));
      monthKeys.push(`${date.getFullYear()}-${date.getMonth()}`);
    }

    return { labels, monthKeys };
  }

  private sumByMonth(viagens: Viagem[], key: string, tipo: 'receita' | 'despesa'): number {
    return viagens
      .filter(v => {
        const d = new Date(v.dataInicio);
        return `${d.getFullYear()}-${d.getMonth()}` === key;
      })
      .reduce((acc, v) => {
        const valor = tipo === 'receita' ? v.valorFrete : this.getTripCost(v);
        return acc + valor;
      }, 0);
  }

  /** Returns ISO year and week number for a given date.
   *  The ISO year may differ from the calendar year at year boundaries
   *  (e.g. Dec 29 2025 belongs to ISO week 1 of 2026). */
  private getISOYearWeek(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const year = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { year, week };
  }

  private getLastEightWeeks(): { labels: string[]; weekKeys: string[] } {
    const labels: string[] = [];
    const weekKeys: string[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      // Align to Monday
      const day = weekStart.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      weekStart.setDate(weekStart.getDate() + diff);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(`${fmt(weekStart)}-${fmt(weekEnd)}`);

      const { year, week } = this.getISOYearWeek(weekStart);
      weekKeys.push(`${year}-W${week}`);
    }

    return { labels, weekKeys };
  }

  private sumByWeek(viagens: Viagem[], key: string, tipo: 'receita' | 'despesa'): number {
    return viagens
      .filter(v => {
        const d = new Date(v.dataInicio);
        const { year, week } = this.getISOYearWeek(d);
        return `${year}-W${week}` === key;
      })
      .reduce((acc, v) => {
        const valor = tipo === 'receita' ? v.valorFrete : this.getTripCost(v);
        return acc + valor;
      }, 0);
  }
}

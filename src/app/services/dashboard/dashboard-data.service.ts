import { Injectable } from '@angular/core';
import { forkJoin, Observable, map, catchError, of } from 'rxjs';
import { Veiculo } from '../../models/veiculo.model';
import { Viagem } from '../../models/viagem.model';
import { ViagemService } from '../viagem/viagem.service';
import { VeiculoService } from '../veiculo/veiculo.service';

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

  constructor(
    private viagemService: ViagemService,
    private veiculoService: VeiculoService
  ) {}

  loadDashboard(): Observable<DashboardData> {
    return forkJoin({
      viagens: this.viagemService.findAll().pipe(catchError(() => of([] as Viagem[]))),
      veiculos: this.veiculoService.findAll().pipe(catchError(() => of([] as Veiculo[])))
    }).pipe(
      map(({ viagens, veiculos }) => ({
        ...this.buildDashboard(viagens, veiculos),
        allViagens: viagens,
        allVeiculos: veiculos
      }))
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
          localizacao: v.localizacaoFrete,
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

  /** Comissão é porcentagem: valorFrete × (comissao / 100) */
  private getTripCost(viagem: Viagem): number {
    const comissaoValor = (viagem.valorFrete * (viagem.comissao || 0)) / 100;
    return comissaoValor + viagem.abastecimento + viagem.despesas;
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

  /** Returns ISO week number for a given date */
  private getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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

      const wk = this.getISOWeek(weekStart);
      weekKeys.push(`${weekStart.getFullYear()}-W${wk}`);
    }

    return { labels, weekKeys };
  }

  private sumByWeek(viagens: Viagem[], key: string, tipo: 'receita' | 'despesa'): number {
    return viagens
      .filter(v => {
        const d = new Date(v.dataInicio);
        const wk = this.getISOWeek(d);
        return `${d.getFullYear()}-W${wk}` === key;
      })
      .reduce((acc, v) => {
        const valor = tipo === 'receita' ? v.valorFrete : this.getTripCost(v);
        return acc + valor;
      }, 0);
  }
}

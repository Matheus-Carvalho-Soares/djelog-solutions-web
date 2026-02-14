import { Injectable } from '@angular/core';
import { forkJoin, Observable, map } from 'rxjs';
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

export interface MonthlyPerformance {
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
  vehiclePerformance: VehiclePerformance[];
  recentTrips: RecentTrip[];
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {

  constructor(
    private viagemService: ViagemService,
    private veiculoService: VeiculoService
  ) {}

  loadDashboard(): Observable<DashboardData> {
    return forkJoin({
      viagens: this.viagemService.findAll(),
      veiculos: this.veiculoService.findAll()
    }).pipe(
      map(({ viagens, veiculos }) => ({
        financialSummary: this.buildFinancialSummary(viagens),
        monthlyPerformance: this.buildMonthlyPerformance(viagens),
        vehiclePerformance: this.buildVehiclePerformance(viagens, veiculos),
        recentTrips: this.buildRecentTrips(viagens)
      }))
    );
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
}

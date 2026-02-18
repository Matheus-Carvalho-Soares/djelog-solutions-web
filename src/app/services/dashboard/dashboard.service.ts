import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Viagem, ViagemStatus } from '../../models/viagem.model';
import { Veiculo } from '../../models/veiculo.model';
import { Motorista } from '../../models/motorista.model';
import { Empresa } from 'src/app/models/empresa.model';

export interface DashboardMetrics {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  viagensAtivas: number;
  viagensComPrejuizo: number;
}

export interface VehiclePerformance {
  veiculoId: string;
  placa: string;
  marca: string;
  totalViagens: number;
  receita: number;
  despesas: number;
  lucro: number;
  percentualLucro: number;
}

export interface Alert {
  id: string;
  tipo: 'prejuizo' | 'sem-faturamento' | 'comissao-pendente' | 'alta-despesa';
  titulo: string;
  descricao: string;
  viagemId?: string;
  veiculoId?: string;
  severidade: 'alta' | 'media' | 'baixa';
}

export interface PerformanceData {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // Dados mockados de empresas
    private empresas: Empresa[] = [];

    // Dados mockados de motoristas
    private motoristas: Motorista[] = [];

    // Dados mockados de veículos
    private veiculos: Veiculo[] = [];

    // Dados mockados de viagens (últimos 6 meses)
    private viagens: Viagem[] = [];

  getMetrics(): Observable<DashboardMetrics> {
    const viagensAtivas = this.viagens.filter(v => v.status === 'EM_ANDAMENTO');
    const todasViagens = this.viagens;

    const receitaTotal = todasViagens.reduce((sum, v) => sum + v.valorFrete, 0);
    const despesaTotal = todasViagens.reduce((sum, v) => 
      sum + (v.valorFrete * (v.comissao || 0) / 100), 0);
    const lucroLiquido = receitaTotal - despesaTotal;

    const viagensComPrejuizo = todasViagens.filter(v => {
      const lucroViagem = v.valorFrete - (v.valorFrete * (v.comissao || 0) / 100);
      return lucroViagem < 0;
    }).length;

    return of({
      receitaTotal: parseFloat(receitaTotal.toFixed(2)),
      despesaTotal: parseFloat(despesaTotal.toFixed(2)),
      lucroLiquido: parseFloat(lucroLiquido.toFixed(2)),
      viagensAtivas: viagensAtivas.length,
      viagensComPrejuizo
    });
  }

  getPerformanceData(): Observable<PerformanceData[]> {
    const mesesAtras = 6;
    const hoje = new Date();
    const data: PerformanceData[] = [];

    for (let i = mesesAtras - 1; i >= 0; i--) {
      const mesData = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = mesData.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const viagensDoMes = this.viagens.filter(v => {
        const vData = new Date(v.dataInicio);
        return vData.getMonth() === mesData.getMonth() && 
               vData.getFullYear() === mesData.getFullYear();
      });

      const receita = viagensDoMes.reduce((sum, v) => sum + v.valorFrete, 0);
      const despesa = viagensDoMes.reduce((sum, v) => 
        sum + (v.valorFrete * (v.comissao || 0) / 100), 0);

      data.push({
        mes: mesNome,
        receita: parseFloat(receita.toFixed(2)),
        despesa: parseFloat(despesa.toFixed(2)),
        lucro: parseFloat((receita - despesa).toFixed(2))
      });
    }

    return of(data);
  }

  getAlerts(): Observable<Alert[]> {
    const alerts: Alert[] = [];

    // Alertas de viagens com prejuízo
    this.viagens.forEach(v => {
      const lucro = v.valorFrete - (v.valorFrete * (v.comissao || 0) / 100);
      if (lucro < 0) {
        alerts.push({
          id: `alert-prejuizo-${v.id}`,
          tipo: 'prejuizo',
          titulo: 'Viagem com prejuízo',
          descricao: `${v.inicioFrete || ''} → ${v.fimFrete || ''} - Prejuízo de R$ ${Math.abs(lucro).toFixed(2)}`,
          viagemId: v.id,
          severidade: 'alta'
        });
      }

      // Viagens sem faturamento
      if (v.valorFrete === 0 && v.status === 'EM_ANDAMENTO') {
        alerts.push({
          id: `alert-sem-fat-${v.id}`,
          tipo: 'sem-faturamento',
          titulo: 'Viagem sem faturamento',
          descricao: `${v.inicioFrete || ''} → ${v.fimFrete || ''} - Necessário lançar valor do frete`,
          viagemId: v.id,
          severidade: 'alta'
        });
      }

      // Comissões pendentes
      if (v.status === 'CONCLUIDA' && !v.comissao && v.comissao > 0) {
        alerts.push({
          id: `alert-comissao-${v.id}`,
          tipo: 'comissao-pendente',
          titulo: 'Comissão pendente',
          descricao: `Motorista aguardando R$ ${v.comissao.toFixed(2)}`,
          viagemId: v.id,
          severidade: 'media'
        });
      }
    });

    // Alertas de veículos com alta despesa (simplified since despesas are now in separate table)
    // Without loading despesas from backend, we skip vehicle expense alerts for the mock service

    return of(alerts.slice(0, 10)); // Limitar a 10 alertas mais relevantes
  }

  getVehiclePerformance(): Observable<VehiclePerformance[]> {
    const performance: VehiclePerformance[] = [];

    this.veiculos.forEach(veiculo => {
      const viagensVeiculo = this.viagens.filter(v => v.veiculo?.id === veiculo.id);
      
      if (viagensVeiculo.length > 0) {
        const receita = viagensVeiculo.reduce((sum, v) => sum + v.valorFrete, 0);
        const despesas = viagensVeiculo.reduce((sum, v) => 
          sum + (v.valorFrete * (v.comissao || 0) / 100), 0);
        const lucro = receita - despesas;

        performance.push({
          veiculoId: veiculo.id!,
          placa: `XXX-${veiculo.id?.slice(-4)}`, // Mock de placa
          marca: veiculo.marca,
          totalViagens: viagensVeiculo.length,
          receita: parseFloat(receita.toFixed(2)),
          despesas: parseFloat(despesas.toFixed(2)),
          lucro: parseFloat(lucro.toFixed(2)),
          percentualLucro: receita > 0 ? parseFloat(((lucro / receita) * 100).toFixed(2)) : 0
        });
      }
    });

    return of(performance.sort((a, b) => b.lucro - a.lucro));
  }

  getRecentTrips(limit: number = 10): Observable<Viagem[]> {
    const sorted = [...this.viagens]
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .slice(0, limit);

    return of(sorted);
  }

  getMotoristaById(id: string): Motorista | undefined {
    return this.motoristas.find(m => m.id === id);
  }

  getEmpresaById(id: string) {
    return this.empresas.find(e => e.id === id);
  }

  getVeiculoById(id: string): Veiculo | undefined {
    return this.veiculos.find(v => v.id === id);
  }
}

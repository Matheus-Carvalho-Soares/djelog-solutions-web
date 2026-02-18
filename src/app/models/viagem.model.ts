import { Profissional } from './profissional.model';
import { Empresa } from './empresa.model';
import { Veiculo } from './veiculo.model';

export type ViagemStatus = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export interface Despesa {
  id?: string;
  viagem?: { id: string };
  nome?: string;
  descricao?: string;
  valor?: number;
}

export interface Viagem {
  id?: string;
  profissional?: Profissional | null;
  empresa?: Empresa | null;
  veiculo?: Veiculo | null;
  inicioFrete: string;
  fimFrete?: string | null;
  valorFrete: number;
  comissao: number;
  dataInicio: string;
  dataFim?: string | null;
  status: ViagemStatus;
}

import { Profissional } from './profissional.model';
import { Empresa } from './empresa.model';
import { Veiculo } from './veiculo.model';

export type ViagemStatus = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export interface Viagem {
  id?: string;
  profissional?: Profissional | null;
  empresa?: Empresa | null;
  veiculo?: Veiculo | null;
  localizacaoFrete: string;
  valorFrete: number;
  comissao: number;
  abastecimento: number;
  despesas: number;
  dataInicio: string;
  dataFim?: string | null;
  status: ViagemStatus;
}

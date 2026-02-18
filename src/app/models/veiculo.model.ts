import { Profissional } from './profissional.model';

export interface Veiculo {
  id?: string; // UUID
  marca: string;
  placa?: string;
  ano?: number;
  nome?: string;
  qtdPeso?: number;
  profissional?: Profissional | null;
  status: boolean;
}

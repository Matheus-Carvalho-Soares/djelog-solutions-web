import { Viagem } from './viagem.model';

export interface Estadia {
  id?: string;
  viagem?: Viagem | { id: string };
  descricao: string;
  valor: number;
}

import { Despesa } from './viagem.model';

export interface ViagemRelatorioDTO {
  dataInicio: string;
  dataFim: string;
  status: string;
  inicioFrete: string;
  fimFrete: string;
  valorFrete: number;
  comissao: number;
  despesas: Despesa[];
  totalDespesas: number;
  profissionalNome: string;
  empresaNome: string;
  veiculoMarca: string;
  veiculoPlaca: string;
  lucroLiquido: number;
}

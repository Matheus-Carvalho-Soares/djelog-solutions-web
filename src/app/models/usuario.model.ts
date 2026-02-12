import { Cargo } from './cargo.model';

export interface UsuarioDTO {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  cargo?: Cargo;
}

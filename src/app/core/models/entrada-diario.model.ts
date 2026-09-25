export interface EntradaDiario {
  idEntrada: number;
  idUsuario: number;
  contenido: string;
  titulo?: string;
  tipoPrompt: string;
  fechaRegistro: string;
}

export interface EntradaDiarioRequest {
  contenido: string;
  tipoPrompt: string;
}

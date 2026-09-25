export interface EntradaDiario {
  idEntrada: number;
  idUsuario: number;
  contenido: string;
  tipoPrompt: string;
  fechaRegistro: string;
}

export interface EntradaDiarioRequest {
  contenido: string;
  tipoPrompt: string;
}

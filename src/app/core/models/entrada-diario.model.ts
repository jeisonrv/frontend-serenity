export interface EntradaDiario {
  idEntrada: number;
  idUsuario: number;
  contenido: string;
  titulo?: string;
  tipoPrompt: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fechaRegistro?: string;
}

export interface EntradaDiarioRequest {
  contenido: string;
  tipoPrompt: string;
}

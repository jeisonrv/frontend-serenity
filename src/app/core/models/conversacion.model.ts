export interface Conversacion {
  idConversacion: number;
  idUsuario: number;
  idOyente: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface MensajeChat {
  idConversacion: number;
  remitente: 'usuario' | 'oyente';
  contenido: string;
  fechaEnvio: string;
}

export interface ReporteRequest {
  idConversacion: number;
  motivo: string;
}

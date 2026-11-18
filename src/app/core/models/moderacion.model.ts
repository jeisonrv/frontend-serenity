export type EstadoReporte = 'PENDIENTE' | 'PROCEDENTE' | 'IMPROCEDENTE';

export interface ReporteChat {
  id: number;
  idConversacion: number;
  idReportante: number;
  idReportado: number;
  motivo: string;
  estado: EstadoReporte;
  fechaReporte: string;
  idModerador: number | null;
  observacionModerador: string | null;
  fechaResolucion: string | null;
}

export interface MensajeModeracion {
  idConversacion: number;
  remitente: string;
  contenido: string;
  fechaEnvio: string;
}

export interface DetalleReporte {
  reporte: ReporteChat;
  idUsuario: number;
  idOyente: number;
  fechaInicio: string;
  fechaFin: string | null;
  mensajes: MensajeModeracion[];
  reportesTotalesDelReportado: number;
  reportesProcedentesDelReportado: number;
}

export interface UsuarioRestringido {
  id: number;
  username: string;
  email: string;
  motivo: string;
  fechaRestriccion: string | null;
  restringidoHasta: string | null;
  restringidoPor: number | null;
}

export interface ResolverReporteRequest {
  procedente: boolean;
  observacion: string;
}

export interface RestriccionRequest {
  motivo: string;
  hasta?: string;
}

export interface RestriccionResponse {
  id: number;
  restringido: boolean;
  restringidoHasta: string | null;
}

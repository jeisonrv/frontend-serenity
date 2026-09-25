export type TipoEjercicio = 'respiracion' | 'meditacion' | 'relajacion' | 'diario';

export interface Sesion {
  idSesion: number;
  idUsuario: number;
  tipoEjercicio: TipoEjercicio;
  duracion: number; // segundos
  experienciaGanada: number;
  fechaCompletada: string;
}

export interface SesionRequest {
  tipoEjercicio: TipoEjercicio;
  duracion: number;
}

export interface Oyente {
  disponible: boolean;
  fechaActualizacion: string | null;
}

export interface CharlaDisponible {
  idConversacion: number;
  fechaInicio: string;
  minutosEnEspera: number;
}

export interface ColaCharlas {
  hayCharlas: boolean;
  total: number;
  charlas: CharlaDisponible[];
}

export interface CharlaActiva {
  idConversacion: number;
  fechaInicio: string;
  fechaFin: string | null;
}

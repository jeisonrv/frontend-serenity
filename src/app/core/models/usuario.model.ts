export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  nivel: number;
  experiencia: number;
  racha: number;
  mejorRacha: number;
  ultimaActividad: string;
  fechaRegistro: string;
}

export interface RegistroRequest {
  nombreUsuario: string;
  correo: string;
  contrasena: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

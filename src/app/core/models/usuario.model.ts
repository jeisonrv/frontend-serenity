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

export interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nivel: number;
  xp: number;
  monedas: number;
}

export interface RegistroRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioResponse;
}

export type AuthResponse = LoginResponse;

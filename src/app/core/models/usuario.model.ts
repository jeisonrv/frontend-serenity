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

export type RolSerenity = 'USUARIO' | 'OYENTE' | 'MODERADOR';

export interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nivel: number;
  xp: number;
  idUsuario?: number;
  nombreUsuario?: string;
  correo?: string;
  experiencia?: number;
  racha?: number;
  mejorRacha?: number;
  ultimaActividad?: string | null;
  fechaRegistro?: string | null;
  rol?: RolSerenity;
  /** Campo consumido por la UI si otra fuente lo aporta; no viene en UsuarioResponse del backend. */
  monedas?: number;
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

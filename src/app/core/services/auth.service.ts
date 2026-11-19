import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RolSerenity,
  UsuarioResponse
} from '../models/usuario.model';

const TOKEN_KEY = 'serenity_token';
const USER_KEY = 'serenity_usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _usuario = signal<UsuarioResponse | null>(
      this.leerUsuarioGuardado()
  );

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this.isLoggedIn());

  constructor(private http: HttpClient) {}

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http
        .post<LoginResponse>(
            `${environment.apiUrl}/auth/login`,
            datos
        )
        .pipe(
            tap((res) => this.guardarSesion(this.normalizarRespuesta(res)))
        );
  }

  iniciarConGoogle(credential: string, username?: string, consentimientos?: { acceptTerms: boolean; acceptSensitiveData: boolean }): Observable<LoginResponse> {
    return this.http
        .post<LoginResponse>(
            `${environment.apiUrl}/auth/google`,
            { credential, ...(username ? { username } : {}), ...(consentimientos ?? {}) }
        )
        .pipe(
            tap((res) => this.guardarSesion(this.normalizarRespuesta(res)))
        );
  }

  vincularGoogle(credential: string): Observable<void> {
    return this.http.post<void>(
        `${environment.apiUrl}/auth/vincular`,
        { credential }
    );
  }

  registrar(datos: RegistroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(
        `${environment.apiUrl}/auth/registro`,
        datos
    ).pipe(map((usuario) => this.normalizarUsuario(usuario)));
  }
  cambiarPassword(
      passwordActual: string,
      passwordNueva: string
  ): Observable<void> {
    return this.http.post<void>(
        `${environment.apiUrl}/auth/cambiar-password`,
        {
          passwordActual,
          passwordNueva
        }
    );
  }

  crearPassword(passwordNueva: string): Observable<void> {
    return this.http.post<void>(
        `${environment.apiUrl}/auth/crear-password`,
        { passwordNueva }
    );
  }

  refrescarPerfil(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${environment.apiUrl}/usuarios/me`).pipe(
      map((usuario) => this.normalizarUsuario(usuario)),
      tap((usuario) => this.actualizarUsuario(usuario))
    );
  }

  solicitarRecuperacion(correo: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/auth/olvide-password`,
      { correo }
    );
  }

  restablecerPassword(token: string, passwordNueva: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/auth/restablecer-password`,
      { token, passwordNueva }
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get token(): string | null {
    return this.getToken();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.tokenExpirado(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  getRole(): RolSerenity | null {
    const usuario = this.usuario();
    if (usuario?.rol) return usuario.rol;

    const claims = this.leerClaimsJwt();
    const rawRole =
      claims?.['rol'] ??
      claims?.['role'] ??
      claims?.['roles'] ??
      claims?.['authorities'];
    return this.normalizarRol(rawRole);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  cerrarSesion(): void {
    this.logout();
  }

  actualizarUsuario(usuario: UsuarioResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private guardarSesion(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._usuario.set(res.usuario);
  }

  private normalizarRespuesta(res: LoginResponse): LoginResponse {
    const raw = res as unknown as Record<string, unknown>;
    const token =
      typeof raw['token'] === 'string' ? raw['token'] :
      typeof raw['accessToken'] === 'string' ? raw['accessToken'] :
      typeof raw['jwt'] === 'string' ? raw['jwt'] : '';

    const usuarioRaw =
      (raw['usuario'] as Record<string, unknown> | undefined) ??
      (raw['user'] as Record<string, unknown> | undefined) ??
      raw;

    const usuario = usuarioRaw as unknown as UsuarioResponse;
    const rol = usuario.rol ?? this.normalizarRol(
      usuarioRaw['rol'] ??
      usuarioRaw['role'] ??
      usuarioRaw['roles'] ??
      usuarioRaw['authorities'] ??
      this.leerClaimsJwt()?.['rol'] ??
      this.leerClaimsJwt()?.['role'] ??
      this.leerClaimsJwt()?.['roles'] ??
      this.leerClaimsJwt()?.['authorities']
    );

    if (!token) throw new Error('El backend no devolvió un token válido.');
    if (!usuario || typeof usuario !== 'object') throw new Error('El backend no devolvió el usuario autenticado.');

    const usuarioNormalizado = this.normalizarUsuario(
      rol ? { ...usuario, rol } : usuario
    );
    return { token, usuario: usuarioNormalizado };
  }

  private normalizarUsuario(usuario: UsuarioResponse): UsuarioResponse {
    return { ...usuario, googleVinculado: usuario.googleVinculado ?? false };
  }

  private leerClaimsJwt(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch {
      return false;
    }
  }

  private normalizarRol(rawRole: unknown): RolSerenity | null {
    if (Array.isArray(rawRole)) rawRole = rawRole[0];
    if (typeof rawRole === 'string') {
      const role = rawRole.replace(/^ROLE_/i, '').toUpperCase();
      if (role === 'USUARIO' || role === 'OYENTE' || role === 'MODERADOR') return role;
    }
    if (rawRole && typeof rawRole === 'object') {
      const authority = (rawRole as { authority?: unknown }).authority;
      if (typeof authority === 'string') return this.normalizarRol(authority);
    }
    return null;
  }

  private leerUsuarioGuardado(): UsuarioResponse | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UsuarioResponse;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}

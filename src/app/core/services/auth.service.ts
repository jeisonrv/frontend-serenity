import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario, UsuarioResponse } from '../models/usuario.model';

const TOKEN_KEY = 'serenity_token';
const USER_KEY = 'serenity_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(this.leerUsuarioGuardado());
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);

  constructor(private http: HttpClient) {}

  login(datos: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  registrar(datos: RegistroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${environment.apiUrl}/auth/registro`, datos);
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  actualizarUsuario(usuario: Usuario): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._usuario.set(res.usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  }
}

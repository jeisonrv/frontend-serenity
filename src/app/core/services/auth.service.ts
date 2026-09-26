import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegistroRequest, UsuarioResponse } from '../models/usuario.model';

const TOKEN_KEY = 'serenity_token';
const USER_KEY = 'serenity_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<UsuarioResponse | null>(this.leerUsuarioGuardado());
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this.isLoggedIn());

  constructor(private http: HttpClient) {}

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  registrar(datos: RegistroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${environment.apiUrl}/auth/registro`, datos);
  }

  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
  get token(): string | null { return this.getToken(); }
  isLoggedIn(): boolean { return this.getToken() !== null; }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  cerrarSesion(): void { this.logout(); }

  actualizarUsuario(usuario: UsuarioResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private guardarSesion(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._usuario.set(res.usuario);
  }

  private leerUsuarioGuardado(): UsuarioResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as UsuarioResponse : null;
  }
}

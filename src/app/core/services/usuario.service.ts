import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsuarioGestion {
  id?: number;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  listar(): Observable<UsuarioGestion[]> { return this.http.get<UsuarioGestion[]>(this.url); }
  crear(usuario: UsuarioGestion): Observable<UsuarioGestion> { return this.http.post<UsuarioGestion>(this.url, usuario); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

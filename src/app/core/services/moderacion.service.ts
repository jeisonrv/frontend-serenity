import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DetalleReporte,
  EstadoReporte,
  ReporteChat,
  ResolverReporteRequest,
  RestriccionRequest,
  RestriccionResponse,
  UsuarioRestringido
} from '../models/moderacion.model';

@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly url = `${environment.apiUrl}/moderacion`;

  constructor(private http: HttpClient) {}

  listarReportes(estado?: EstadoReporte): Observable<ReporteChat[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ReporteChat[]>(`${this.url}/reportes`, { params });
  }

  obtenerDetalle(id: number): Observable<DetalleReporte> {
    return this.http.get<DetalleReporte>(`${this.url}/reportes/${id}`);
  }

  resolverReporte(id: number, request: ResolverReporteRequest): Observable<ReporteChat> {
    return this.http.post<ReporteChat>(`${this.url}/reportes/${id}/resolver`, request);
  }

  listarRestringidos(): Observable<UsuarioRestringido[]> {
    return this.http.get<UsuarioRestringido[]>(`${this.url}/usuarios/restringidos`);
  }

  restringirUsuario(id: number, request: RestriccionRequest): Observable<RestriccionResponse> {
    return this.http.post<RestriccionResponse>(`${this.url}/usuarios/${id}/restriccion`, request);
  }

  levantarRestriccion(id: number): Observable<RestriccionResponse> {
    return this.http.delete<RestriccionResponse>(`${this.url}/usuarios/${id}/restriccion`);
  }
}

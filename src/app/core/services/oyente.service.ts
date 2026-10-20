import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CharlaActiva, ColaCharlas, Oyente } from '../models/oyente.model';

@Injectable({ providedIn: 'root' })
export class OyenteService {
  private readonly url = `${environment.apiUrl}/oyente`;

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<Oyente> {
    return this.http.get<Oyente>(`${this.url}/estado`);
  }

  cambiarDisponibilidad(disponible: boolean): Observable<void> {
    return this.http.put<void>(`${this.url}/estado`, { disponible });
  }

  obtenerCola(): Observable<ColaCharlas> {
    return this.http.get<ColaCharlas>(`${this.url}/charlas/disponibles`);
  }

  obtenerActivas(): Observable<CharlaActiva[]> {
    return this.http.get<CharlaActiva[]>(`${this.url}/charlas/activas`);
  }

  aceptar(idConversacion: number): Observable<void> {
    return this.http.post<void>(`${this.url}/charlas/${idConversacion}/aceptar`, null);
  }
}

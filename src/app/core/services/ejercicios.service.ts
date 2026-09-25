import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sesion, SesionRequest } from '../models/sesion.model';

@Injectable({ providedIn: 'root' })
export class EjerciciosService {
  constructor(private http: HttpClient) {}

  // RF4-RF7: registra una sesión completada (respiración, meditación, relajación o diario)
  registrarSesion(datos: SesionRequest): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/sesiones`, datos);
  }

  historial(): Observable<Sesion[]> {
    return this.http.get<Sesion[]>(`${environment.apiUrl}/sesiones`);
  }
}

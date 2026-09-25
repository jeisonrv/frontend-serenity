import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Logro } from '../models/logro.model';

@Injectable({ providedIn: 'root' })
export class GamificacionService {
  constructor(private http: HttpClient) {}

  // RF11: logros desbloqueables
  listarLogros(): Observable<Logro[]> {
    return this.http.get<Logro[]>(`${environment.apiUrl}/logros`);
  }

  // usado por Estadísticas (historial de actividad)
  resumenEstadisticas(): Observable<{ totalSesiones: number; minutosTotales: number; racha: number }> {
    return this.http.get<{ totalSesiones: number; minutosTotales: number; racha: number }>(
      `${environment.apiUrl}/estadisticas/resumen`
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoAnimo, ValorAnimo } from '../models/estado-animo.model';

@Injectable({ providedIn: 'root' })
export class AnimoService {
  constructor(private http: HttpClient) {}

  // RF3: registrar/actualizar el estado de ánimo del día
  registrarAnimo(valor: ValorAnimo): Observable<EstadoAnimo> {
    return this.http.post<EstadoAnimo>(`${environment.apiUrl}/animo`, { valor });
  }

  obtenerAnimoHoy(): Observable<EstadoAnimo | null> {
    return this.http.get<EstadoAnimo>(`${environment.apiUrl}/animo/hoy`, { observe: 'response' }).pipe(
      map((response: HttpResponse<EstadoAnimo>) => response.status === 204 ? null : response.body)
    );
  }

  historialAnimo(): Observable<EstadoAnimo[]> {
    return this.http.get<EstadoAnimo[]>(`${environment.apiUrl}/animo`);
  }
}

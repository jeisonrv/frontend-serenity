import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoAnimo } from '../models/estado-animo.model';

@Injectable({ providedIn: 'root' })
export class AnimoService {
  constructor(private http: HttpClient) {}

  // RF3: registrar/actualizar el estado de ánimo del día
  registrarAnimo(valor: 1 | 2 | 3 | 4 | 5): Observable<EstadoAnimo> {
    return this.http.post<EstadoAnimo>(`${environment.apiUrl}/animo`, { valor });
  }

  historialAnimo(): Observable<EstadoAnimo[]> {
    return this.http.get<EstadoAnimo[]>(`${environment.apiUrl}/animo`);
  }
}

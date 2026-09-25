import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntradaDiario, EntradaDiarioRequest } from '../models/entrada-diario.model';

@Injectable({ providedIn: 'root' })
export class DiarioService {
  constructor(private http: HttpClient) {}

  // RF7: escribir y guardar entradas de diario
  guardarEntrada(datos: EntradaDiarioRequest): Observable<EntradaDiario> {
    return this.http.post<EntradaDiario>(`${environment.apiUrl}/diario`, datos);
  }

  listarEntradas(): Observable<EntradaDiario[]> {
    return this.http.get<EntradaDiario[] | { content: EntradaDiario[] }>(`${environment.apiUrl}/diario`).pipe(
      map((respuesta) => {
        if (Array.isArray(respuesta)) return respuesta;
        if (respuesta && typeof respuesta === 'object' && Array.isArray(respuesta.content)) {
          return respuesta.content;
        }
        throw new Error('La respuesta del historial del diario no tiene un formato válido.');
      })
    );
  }

  obtenerEntrada(id: number): Observable<EntradaDiario> {
    return this.http.get<EntradaDiario>(`${environment.apiUrl}/diario/${id}`);
  }

  actualizarEntrada(id: number, datos: EntradaDiarioRequest): Observable<EntradaDiario> {
    return this.http.put<EntradaDiario>(`${environment.apiUrl}/diario/${id}`, datos);
  }

  eliminarEntrada(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/diario/${id}`);
  }
}

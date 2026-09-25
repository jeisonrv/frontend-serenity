import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<EntradaDiario[]>(`${environment.apiUrl}/diario`);
  }
}

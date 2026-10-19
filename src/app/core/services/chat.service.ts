import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversacion, ReporteRequest } from '../models/conversacion.model';

/**
 * Capa HTTP para las operaciones de conversación.
 * La conexión STOMP/WebSocket se administra en ChatRealtimeService.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  solicitarConversacion(): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${environment.apiUrl}/chat/solicitar`, {});
  }

  finalizar(idConversacion: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/chat/${idConversacion}/finalizar`, {});
  }

  reportar(datos: ReporteRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/chat/reporte`, datos);
  }
}

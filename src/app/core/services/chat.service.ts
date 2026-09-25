import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversacion, MensajeChat, ReporteRequest } from '../models/conversacion.model';
import { AuthService } from './auth.service';

/**
 * RF12/RF13: solicitud de chat y mensajería en tiempo real vía STOMP sobre WebSocket.
 * El backend (Spring WebSocket + STOMP) debe exponer:
 *   - CONNECT en environment.wsUrl
 *   - topic de suscripción:  /topic/conversacion/{id}
 *   - destino de envío:      /app/conversacion/{id}/enviar
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private client?: Client;
  readonly mensajes = signal<MensajeChat[]>([]);
  readonly conectado = signal(false);

  constructor(private http: HttpClient, private auth: AuthService) {}

  solicitarConversacion(): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${environment.apiUrl}/chat/solicitar`, {});
  }

  conectar(idConversacion: number): void {
    this.client = new Client({
      brokerURL: environment.wsUrl,
      connectHeaders: { Authorization: `Bearer ${this.auth.token ?? ''}` },
      reconnectDelay: 3000,
      onConnect: () => {
        this.conectado.set(true);
        this.client?.subscribe(`/topic/conversacion/${idConversacion}`, (msg: IMessage) => {
          const nuevo: MensajeChat = JSON.parse(msg.body);
          this.mensajes.update((actual) => [...actual, nuevo]);
        });
      },
      onDisconnect: () => this.conectado.set(false)
    });
    this.client.activate();
  }

  enviarMensaje(idConversacion: number, contenido: string): void {
    this.client?.publish({
      destination: `/app/conversacion/${idConversacion}/enviar`,
      body: JSON.stringify({ contenido })
    });
  }

  finalizar(idConversacion: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/chat/${idConversacion}/finalizar`, {});
  }

  reportar(datos: ReporteRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/chat/reporte`, datos);
  }

  desconectar(): void {
    this.client?.deactivate();
    this.mensajes.set([]);
  }
}

import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';
import { MensajeChat } from '../models/conversacion.model';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

/**
 * Gestiona exclusivamente la mensajería en tiempo real por STOMP/WebSocket.
 * Mantiene los mensajes y el estado de conexión para la interfaz de chat.
 */
@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private client?: Client;
  readonly mensajes = signal<MensajeChat[]>([]);
  readonly conectado = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private auth: AuthService, private logger: LoggerService) {}

  conectar(idConversacion: number, mensajesIniciales: MensajeChat[] = []): void {
    this.desconectar();
    this.mensajes.set(mensajesIniciales);
    this.error.set(null);

    const client = new Client({
      brokerURL: environment.wsUrl,
      connectHeaders: { Authorization: `Bearer ${this.auth.token ?? ''}` },
      reconnectDelay: 3000,
      onConnect: () => {
        this.conectado.set(true);
        client.subscribe(`/topic/conversacion/${idConversacion}`, (msg: IMessage) => {
          try {
            const nuevo = JSON.parse(msg.body) as MensajeChat;
            this.mensajes.update((actuales) => [...actuales, nuevo]);
          } catch {
            this.logger.error('No fue posible interpretar un mensaje recibido por WebSocket.');
          }
        });
      },
      onStompError: (frame) => {
        const mensaje = frame.headers['message']?.trim() || frame.body?.trim();
        this.error.set(mensaje || 'El servidor rechazó la conexión a la conversación.');
      },
      onWebSocketError: (event) => {
        const mensaje = event instanceof ErrorEvent ? event.message.trim() : '';
        this.error.set(mensaje || 'No se pudo establecer la conexión en tiempo real.');
      },
      onDisconnect: () => this.conectado.set(false),
      onWebSocketClose: () => this.conectado.set(false)
    });

    this.client = client;
    client.activate();
  }

  enviarMensaje(idConversacion: number, contenido: string): void {
    if (!this.client || !this.conectado()) return;

    this.client.publish({
      destination: `/app/conversacion/${idConversacion}/enviar`,
      body: JSON.stringify({ contenido })
    });
  }

  desconectar(): void {
    const clienteActual = this.client;
    this.client = undefined;
    this.conectado.set(false);
    this.mensajes.set([]);
    this.error.set(null);

    if (clienteActual) {
      void clienteActual.deactivate();
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';
import { MensajeChat } from '../models/conversacion.model';
import { AuthService } from './auth.service';

/**
 * Gestiona exclusivamente la mensajería en tiempo real por STOMP/WebSocket.
 * Mantiene los mensajes y el estado de conexión para la interfaz de chat.
 */
@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private client?: Client;
  readonly mensajes = signal<MensajeChat[]>([]);
  readonly conectado = signal(false);

  constructor(private auth: AuthService) {}

  conectar(idConversacion: number): void {
    this.desconectar();

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
            console.error('No fue posible interpretar un mensaje recibido por WebSocket.');
          }
        });
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

    if (clienteActual) {
      void clienteActual.deactivate();
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';
import { MensajeChat } from '../models/conversacion.model';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

/**
 * Gestiona las conversaciones activas y conserva sus mensajes durante la navegación.
 */
@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private client?: Client;
  private readonly cacheMensajes = new Map<number, MensajeChat[]>();
  private readonly suscripciones = new Map<number, { unsubscribe(): void }>();
  private conversacionesActivas = new Set<number>();
  readonly idConversacionActual = signal<number | null>(null);
  readonly mensajes = signal<MensajeChat[]>([]);
  readonly conectado = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private auth: AuthService, private logger: LoggerService) {}

  conectar(idConversacion: number, mensajesIniciales: MensajeChat[] = []): void {
    this.idConversacionActual.set(idConversacion);
    this.conversacionesActivas.add(idConversacion);
    const mensajes = this.combinarMensajes(
      this.cacheMensajes.get(idConversacion) ?? [],
      mensajesIniciales
    );
    this.cacheMensajes.set(idConversacion, mensajes);
    this.mensajes.set(mensajes);
    this.error.set(null);

    this.conectarSocket();
    if (this.client?.connected) this.suscribir(idConversacion);
  }

  conectarActivas(idsConversaciones: number[]): void {
    const activas = new Set(idsConversaciones);
    this.conversacionesActivas = activas;

    for (const [id, suscripcion] of this.suscripciones) {
      if (!activas.has(id)) {
        suscripcion.unsubscribe();
        this.suscripciones.delete(id);
      }
    }

    if (!activas.has(this.idConversacionActual() ?? -1)) {
      this.idConversacionActual.set(null);
      this.mensajes.set([]);
    }

    if (!activas.size) {
      const clienteActual = this.client;
      this.client = undefined;
      this.conectado.set(false);
      if (clienteActual) void clienteActual.deactivate();
      return;
    }
    this.conectarSocket();
    if (this.client?.connected) {
      for (const id of activas) this.suscribir(id);
    }
  }

  enviarMensaje(idConversacion: number, contenido: string): void {
    if (!this.client || !this.conectado()) return;
    this.client.publish({
      destination: `/app/conversacion/${idConversacion}/enviar`,
      body: JSON.stringify({ contenido })
    });
  }

  finalizar(idConversacion: number): void {
    this.suscripciones.get(idConversacion)?.unsubscribe();
    this.suscripciones.delete(idConversacion);
    this.conversacionesActivas.delete(idConversacion);
    if (this.idConversacionActual() === idConversacion) {
      this.idConversacionActual.set(null);
      this.mensajes.set([]);
    }
  }

  desconectar(): void {
    const clienteActual = this.client;
    this.client = undefined;
    this.suscripciones.clear();
    this.conversacionesActivas.clear();
    this.cacheMensajes.clear();
    this.idConversacionActual.set(null);
    this.conectado.set(false);
    this.mensajes.set([]);
    this.error.set(null);
    if (clienteActual) void clienteActual.deactivate();
  }

  private conectarSocket(): void {
    if (this.client) return;

    const wsUrl = environment.wsUrl.startsWith('/')
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${environment.wsUrl}`
      : environment.wsUrl;

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${this.auth.token ?? ''}` },
      reconnectDelay: 3000,
      onConnect: () => {
        this.conectado.set(true);
        for (const id of this.conversacionesActivas) this.suscribir(id);
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

  private suscribir(idConversacion: number): void {
    if (!this.client?.connected || this.suscripciones.has(idConversacion)) return;
    const subscription = this.client.subscribe(
      `/topic/conversacion/${idConversacion}`,
      (msg: IMessage) => {
        try {
          const nuevo = JSON.parse(msg.body) as MensajeChat;
          const placeholder = 'Gracias por compartirlo. Estoy aquí para acompañarte. ¿Qué te gustaría explorar?';
          if (nuevo.contenido && nuevo.contenido.trim() === placeholder) {
            this.logger.warn('Mensaje placeholder recibido y descartado.');
            return;
          }
          const mensajes = this.combinarMensajes(
            this.cacheMensajes.get(idConversacion) ?? [],
            [nuevo]
          );
          this.cacheMensajes.set(idConversacion, mensajes);
          if (this.idConversacionActual() === idConversacion) this.mensajes.set(mensajes);
        } catch {
          this.logger.error('No fue posible interpretar un mensaje recibido por WebSocket.');
        }
      }
    );
    this.suscripciones.set(idConversacion, subscription);
  }

  private combinarMensajes(
    existentes: MensajeChat[],
    nuevos: MensajeChat[]
  ): MensajeChat[] {
    const mensajes = new Map<string, MensajeChat>();
    for (const mensaje of [...existentes, ...nuevos]) {
      const id = (mensaje as MensajeChat & { idMensaje?: number }).idMensaje;
      const clave = id !== undefined
        ? `id:${id}`
        : `${mensaje.fechaEnvio}|${mensaje.remitente}|${mensaje.contenido}`;
      mensajes.set(clave, mensaje);
    }
    return [...mensajes.values()].sort((a, b) => {
      const diferencia = Date.parse(a.fechaEnvio) - Date.parse(b.fechaEnvio);
      return Number.isNaN(diferencia) ? 0 : diferencia;
    });
  }
}

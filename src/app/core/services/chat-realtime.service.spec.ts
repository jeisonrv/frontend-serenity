import { AuthService } from './auth.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { LoggerService } from './logger.service';
import { Client } from '@stomp/stompjs';

describe('ChatRealtimeService', () => {
  let service: ChatRealtimeService;

  beforeEach(() => {
    service = new ChatRealtimeService({ token: 'token-prueba' } as unknown as AuthService, new LoggerService());
  });

  afterEach(() => service.desconectar());

  it('no envía mensajes cuando el cliente no está conectado', () => {
    expect(() => service.enviarMensaje(1, 'hola')).not.toThrow();
    expect(service.conectado()).toBeFalse();
    expect(service.mensajes()).toEqual([]);
  });

  it('desconecta y limpia los mensajes y errores', () => {
    service.mensajes.set([{ idMensaje: 1, contenido: 'hola' } as any]);
    service.conectado.set(true);
    service.error.set('error previo');

    service.desconectar();

    expect(service.conectado()).toBeFalse();
    expect(service.mensajes()).toEqual([]);
    expect(service.error()).toBeNull();
  });

  it('conserva el historial separado al cambiar entre conversaciones activas', () => {
    spyOn(Client.prototype, 'activate').and.stub();
    const mensajeUno = {
      idConversacion: 1, remitente: 'usuario', contenido: 'Uno',
      fechaEnvio: '2026-01-01T10:00:00Z'
    } as const;
    const mensajeDos = {
      idConversacion: 2, remitente: 'oyente', contenido: 'Dos',
      fechaEnvio: '2026-01-01T10:01:00Z'
    } as const;

    service.conectarActivas([1, 2]);
    service.conectar(1, [mensajeUno]);
    service.conectar(2, [mensajeDos]);
    expect(service.mensajes()).toEqual([mensajeDos]);

    service.conectar(1);
    expect(service.mensajes()).toEqual([mensajeUno]);
    expect(Client.prototype.activate).toHaveBeenCalledTimes(1);
  });
});

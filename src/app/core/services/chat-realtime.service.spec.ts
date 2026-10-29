import { AuthService } from './auth.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { LoggerService } from './logger.service';

describe('ChatRealtimeService', () => {
  let service: ChatRealtimeService;

  beforeEach(() => {
    service = new ChatRealtimeService({ token: 'token-prueba' } as unknown as AuthService, new LoggerService());
  });

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
});

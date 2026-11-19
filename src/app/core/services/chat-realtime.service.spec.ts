import { AuthService } from './auth.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { LoggerService } from './logger.service';
import { Client, IMessage } from '@stomp/stompjs';

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

  it('mantiene una conexión, evita suscripciones duplicadas y cancela solo la conversación finalizada', () => {
    const unsubscribeUno = jasmine.createSpy('unsubscribeUno');
    const unsubscribeDos = jasmine.createSpy('unsubscribeDos');
    const subscribe = jasmine.createSpy('subscribe').and.callFake((topic: string) => ({
      unsubscribe: topic.endsWith('/1') ? unsubscribeUno : unsubscribeDos
    }));
    const deactivate = jasmine.createSpy('deactivate');
    (service as unknown as { client: Client }).client = {
      connected: true,
      subscribe,
      deactivate
    } as unknown as Client;

    service.conectarActivas([1, 2]);
    service.conectarActivas([1, 2]);
    service.conectar(1);
    service.conectar(2);

    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(deactivate).not.toHaveBeenCalled();

    service.finalizar(1);

    expect(unsubscribeUno).toHaveBeenCalledTimes(1);
    expect(unsubscribeDos).not.toHaveBeenCalled();
    expect(deactivate).not.toHaveBeenCalled();

    service.conectarActivas([]);
    expect(deactivate).not.toHaveBeenCalled();
  });

  it('mantiene los mensajes recibidos asociados a su conversación', () => {
    let recibirUno: ((message: IMessage) => void) | undefined;
    let recibirDos: ((message: IMessage) => void) | undefined;
    const subscribe = jasmine.createSpy('subscribe').and.callFake(
      (topic: string, callback: (message: IMessage) => void) => {
        if (topic.endsWith('/1')) recibirUno = callback;
        if (topic.endsWith('/2')) recibirDos = callback;
        return { unsubscribe: jasmine.createSpy('unsubscribe') };
      }
    );
    (service as unknown as { client: Client }).client = {
      connected: true,
      subscribe,
      deactivate: jasmine.createSpy('deactivate')
    } as unknown as Client;
    service.conectarActivas([1, 2]);
    service.conectar(1);

    recibirDos?.({
      body: JSON.stringify({
        idConversacion: 2, remitente: 'oyente', contenido: 'Solo dos',
        fechaEnvio: '2026-01-01T10:00:00Z'
      })
    } as IMessage);
    expect(service.mensajes()).toEqual([]);

    recibirUno?.({
      body: JSON.stringify({
        idConversacion: 1, remitente: 'usuario', contenido: 'Solo uno',
        fechaEnvio: '2026-01-01T10:01:00Z'
      })
    } as IMessage);
    recibirUno?.({
      body: JSON.stringify({
        idConversacion: 1, remitente: 'usuario', contenido: 'Solo uno',
        fechaEnvio: '2026-01-01T10:01:00Z'
      })
    } as IMessage);
    expect(service.mensajes().map((mensaje) => mensaje.contenido)).toEqual(['Solo uno']);

    service.conectar(2);
    expect(service.mensajes().map((mensaje) => mensaje.contenido)).toEqual(['Solo dos']);
  });
});

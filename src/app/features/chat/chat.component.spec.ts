import { EnvironmentInjector, ElementRef, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ChatRealtimeService } from '../../core/services/chat-realtime.service';
import { ChatService } from '../../core/services/chat.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let chatService: jasmine.SpyObj<ChatService>;
  let realtime: ChatRealtimeService;
  let realtimeSpies: jasmine.SpyObj<ChatRealtimeService>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    chatService = jasmine.createSpyObj<ChatService>(
      'ChatService',
      ['listarMensajes', 'solicitarConversacion', 'finalizar', 'reportar']
    );
    chatService.listarMensajes.and.returnValue(of([
      { idConversacion: 7, remitente: 'usuario', contenido: 'Historial 😊', fechaEnvio: '2026-01-01T10:00:00Z' }
    ]));
    chatService.finalizar.and.returnValue(of(void 0));
    realtimeSpies = jasmine.createSpyObj<ChatRealtimeService>(
      'ChatRealtimeService',
      ['conectar', 'enviarMensaje', 'desconectar', 'finalizar']
    );
    realtime = Object.assign(realtimeSpies, {
      mensajes: signal([]),
      conectado: signal(true),
      error: signal<string | null>(null)
    }) as unknown as ChatRealtimeService;
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['usuario']);
    auth.usuario.and.returnValue({ rol: 'OYENTE' } as any);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'getCurrentNavigation']);
    router.getCurrentNavigation.and.returnValue(null);

    TestBed.configureTestingModule({});
    const route = {
      paramMap: of(convertToParamMap({ id: '7' }))
    } as ActivatedRoute;
    component = runInInjectionContext(
      TestBed.inject(EnvironmentInjector),
      () => new ChatComponent(chatService, realtime, route, auth, router)
    );
  });

  it('carga el historial de la conversación asignada y conserva la conexión al salir', () => {
    component.ngOnInit();

    expect(chatService.listarMensajes).toHaveBeenCalledWith(7);
    expect(realtimeSpies.conectar).toHaveBeenCalledWith(7, jasmine.any(Array));
    expect(component.estado()).toBe('activo');

    component.ngOnDestroy();
    expect(realtimeSpies.desconectar).not.toHaveBeenCalled();
  });

  it('vuelve al panel del oyente sin finalizar ni desconectar la conversación', () => {
    component.ngOnInit();
    component.volverAConversaciones();

    expect(router.navigate).toHaveBeenCalledWith(['/oyente']);
    expect(chatService.finalizar).not.toHaveBeenCalled();
    expect(realtimeSpies.finalizar).not.toHaveBeenCalled();
    expect(realtimeSpies.desconectar).not.toHaveBeenCalled();
  });

  it('agrega emojis al borrador sin reemplazar el texto existente', () => {
    component.ngOnInit();
    component.borrador.set('Hola ');
    component.agregarEmoji('💙');

    expect(component.borrador()).toBe('Hola 💙');
  });

  it('permite enviar un mensaje compuesto solo por emojis', () => {
    component.ngOnInit();
    component.conversacion.set({ idConversacion: 7 });
    component.borrador.set('😊✨');

    component.enviar();

    expect(realtimeSpies.enviarMensaje).toHaveBeenCalledWith(7, '😊✨');
    expect(component.borrador()).toBe('');
  });

  it('no ofrece la acción de emojis ni cambia el borrador para el usuario', () => {
    auth.usuario.and.returnValue({ rol: 'USUARIO' } as any);
    component.ngOnInit();
    component.borrador.set('texto');

    component.alternarEmojis();
    component.agregarEmoji('💙');

    expect(component.esOyente()).toBeFalse();
    expect(component.mostrarEmojis()).toBeFalse();
    expect(component.borrador()).toBe('texto');
  });

  it('muestra indicador sin desplazar si se leen mensajes anteriores y desplaza si está al final', () => {
    let scrollTop = 0;
    let pendingFrame: FrameRequestCallback | undefined;
    const scrollTo = jasmine.createSpy('scrollTo').and.callFake((options: ScrollToOptions) => {
      scrollTop = Number(options.top);
    });
    const element = {
      scrollHeight: 1000,
      get scrollTop() { return scrollTop; },
      set scrollTop(value: number) { scrollTop = value; },
      clientHeight: 300,
      scrollTo
    } as unknown as HTMLDivElement;
    (component as unknown as { listaMensajes?: ElementRef<HTMLDivElement> }).listaMensajes =
      new ElementRef(element);

    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      pendingFrame = callback;
      return 1;
    });
    component.ngOnInit();
    component.ngAfterViewInit();
    pendingFrame?.(0);
    scrollTo.calls.reset();
    scrollTop = 0;
    component.alDesplazarse();
    realtime.mensajes.set([{
      idConversacion: 7, remitente: 'usuario', contenido: 'Nuevo',
      fechaEnvio: '2026-01-02T10:00:00Z'
    }]);
    TestBed.flushEffects();
    pendingFrame?.(0);

    expect(component.mostrarNuevosMensajes()).toBeTrue();
    expect(scrollTo).not.toHaveBeenCalled();

    scrollTop = 650;
    component.alDesplazarse();
    realtime.mensajes.set([{
      idConversacion: 7, remitente: 'usuario', contenido: 'Más reciente',
      fechaEnvio: '2026-01-02T10:01:00Z'
    }]);
    TestBed.flushEffects();
    pendingFrame?.(0);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
  });

  it('finaliza solo cuando se invoca la acción explícita de finalizar', () => {
    component.conversacion.set({ idConversacion: 7 });
    component.finalizarConversacion();

    expect(chatService.finalizar).toHaveBeenCalledWith(7);
    expect(realtimeSpies.finalizar).toHaveBeenCalledWith(7);
    expect(component.estado()).toBe('finalizado');
  });

  it('desplaza al final cuando el usuario pide ver el último mensaje', () => {
    const scrollTo = jasmine.createSpy('scrollTo');
    const element = { scrollHeight: 500, scrollTo } as unknown as HTMLDivElement;
    (component as unknown as { listaMensajes: ElementRef<HTMLDivElement> }).listaMensajes =
      new ElementRef(element);

    component.ngOnInit();
    component.irAlUltimoMensaje();

    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });
    expect(component.mostrarNuevosMensajes()).toBeFalse();
  });
});

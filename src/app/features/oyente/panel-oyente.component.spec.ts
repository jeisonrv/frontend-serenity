import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { OyenteService } from '../../core/services/oyente.service';
import { PanelOyenteComponent } from './panel-oyente.component';

describe('PanelOyenteComponent', () => {
  let component: PanelOyenteComponent;
  let api: jasmine.SpyObj<OyenteService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    api = jasmine.createSpyObj<OyenteService>('OyenteService', [
      'obtenerEstado', 'obtenerCola', 'obtenerActivas',
      'cambiarDisponibilidad', 'aceptar'
    ]);
    api.obtenerEstado.and.returnValue(of({ disponible: false } as any));
    api.obtenerCola.and.returnValue(of({ charlas: [] } as any));
    api.obtenerActivas.and.returnValue(of([]));
    api.cambiarDisponibilidad.and.returnValue(of({ disponible: true } as any));
    api.aceptar.and.returnValue(of({} as any));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));
    component = new PanelOyenteComponent(api, router);
  });

  it('carga estado, cola y conversaciones activas al iniciar', () => {
    component.ngOnInit();
    expect(api.obtenerEstado).toHaveBeenCalled();
    expect(api.obtenerCola).toHaveBeenCalled();
    expect(api.obtenerActivas).toHaveBeenCalled();
    expect(component.cargandoEstado()).toBeFalse();
    expect(component.cargandoCola()).toBeFalse();
    expect(component.cargandoActivas()).toBeFalse();
  });

  it('guarda los datos recibidos al actualizar el panel', () => {
    const estado = { disponible: true, username: 'oyente' } as any;
    const charla = { idConversacion: 4 } as any;
    api.obtenerEstado.and.returnValue(of(estado));
    api.obtenerCola.and.returnValue(of({ charlas: [charla] } as any));
    api.obtenerActivas.and.returnValue(of([{ idConversacion: 5 }] as any));
    component.actualizar();
    expect(component.estado()).toEqual(estado);
    expect(component.cola()).toEqual([charla]);
    expect(component.activas().length).toBe(1);
  });

  it('no cambia disponibilidad si no hay estado o ya se está guardando', () => {
    component.cambiarDisponibilidad();
    expect(api.cambiarDisponibilidad).not.toHaveBeenCalled();
    component.estado.set({ disponible: false } as any);
    component.guardandoDisponibilidad.set(true);
    component.cambiarDisponibilidad();
    expect(api.cambiarDisponibilidad).not.toHaveBeenCalled();
  });

  it('respeta la cancelación del diálogo de disponibilidad', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.estado.set({ disponible: false } as any);
    component.cambiarDisponibilidad();
    expect(api.cambiarDisponibilidad).not.toHaveBeenCalled();
  });

  it('cambia disponibilidad y refresca estado y cola', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.estado.set({ disponible: false } as any);
    component.cambiarDisponibilidad();
    expect(api.cambiarDisponibilidad).toHaveBeenCalledWith(true);
    expect(component.confirmacion()).toBe('Tu disponibilidad quedó activada.');
    expect(api.obtenerEstado).toHaveBeenCalled();
    expect(api.obtenerCola).toHaveBeenCalled();
    expect(component.guardandoDisponibilidad()).toBeFalse();
  });

  it('muestra un error si falla el cambio de disponibilidad', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    api.cambiarDisponibilidad.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Error de disponibilidad' } })
    ));
    component.estado.set({ disponible: false } as any);
    component.cambiarDisponibilidad();
    expect(component.error()).toBe('Error de disponibilidad');
    expect(component.guardandoDisponibilidad()).toBeFalse();
  });

  it('no acepta una conversación si ya hay otra aceptación en curso', () => {
    component.aceptandoId.set(8);
    component.aceptar({ idConversacion: 9 } as any);
    expect(api.aceptar).not.toHaveBeenCalled();
  });

  it('respeta la cancelación al aceptar una conversación', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.aceptar({ idConversacion: 9 } as any);
    expect(api.aceptar).not.toHaveBeenCalled();
  });

  it('acepta una conversación, refresca listas y navega al chat', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.aceptar({ idConversacion: 9 } as any);
    expect(api.aceptar).toHaveBeenCalledWith(9);
    expect(api.obtenerCola).toHaveBeenCalled();
    expect(api.obtenerActivas).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 9], {
      state: { confirmacion: 'Aceptaste la conversación #9.' }
    });
    expect(component.aceptandoId()).toBeNull();
  });

  it('muestra el error si falla la aceptación de una conversación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    api.aceptar.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'No se pudo aceptar' } })
    ));
    component.aceptar({ idConversacion: 9 } as any);
    expect(component.error()).toBe('No se pudo aceptar');
    expect(component.aceptandoId()).toBeNull();
  });

  it('propaga errores de carga en las tres secciones', () => {
    api.obtenerEstado.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Estado' } })
    ));
    api.obtenerCola.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Cola' } })
    ));
    api.obtenerActivas.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Activas' } })
    ));
    component.actualizar();
    expect(component.error()).toBe('Activas');
    expect(component.cargandoEstado()).toBeFalse();
    expect(component.cargandoCola()).toBeFalse();
    expect(component.cargandoActivas()).toBeFalse();
  });
});

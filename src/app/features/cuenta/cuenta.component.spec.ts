import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { CuentaComponent } from './cuenta.component';

describe('CuentaComponent', () => {
  let component: CuentaComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let recordatorios: jasmine.SpyObj<RecordatoriosService>;

  beforeEach(() => {
    recordatorios = jasmine.createSpyObj<RecordatoriosService>(
      'RecordatoriosService', ['consultar', 'actualizar']
    );
    recordatorios.consultar.and.returnValue(of({ activo: true }));
    recordatorios.actualizar.and.returnValue(of({ activo: true }));
    auth = jasmine.createSpyObj<AuthService>(
      'AuthService', ['isLoggedIn', 'vincularGoogle', 'cambiarPassword']
    );
    auth.isLoggedIn.and.returnValue(true);
    auth.vincularGoogle.and.returnValue(of(void 0));
    auth.cambiarPassword.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [{ provide: RecordatoriosService, useValue: recordatorios }]
    });
    component = runInInjectionContext(
      TestBed.inject(EnvironmentInjector),
      () => new CuentaComponent(auth)
    );
  });

  it('consulta recordatorios al iniciar una sesión autenticada', () => {
    component.ngOnInit();
    expect(recordatorios.consultar).toHaveBeenCalled();
    expect(component.recordatoriosActivos()).toBeTrue();
    expect(component.cargandoRecordatorios()).toBeFalse();
  });

  it('no consulta recordatorios si la sesión no está iniciada', () => {
    auth.isLoggedIn.and.returnValue(false);
    component.ngOnInit();
    expect(recordatorios.consultar).not.toHaveBeenCalled();
  });

  it('presenta el error al fallar la consulta de recordatorios', () => {
    recordatorios.consultar.and.returnValue(throwError(() => new Error('falló')));
    component.cargarRecordatorios();
    expect(component.errorRecordatorios()).toContain('No se pudo consultar');
    expect(component.cargandoRecordatorios()).toBeFalse();
  });

  it('guarda una preferencia de recordatorios y muestra confirmación', () => {
    component.recordatoriosActivos.set(false);
    component.cambiarRecordatorios({ target: { checked: true } } as unknown as Event);
    expect(recordatorios.actualizar).toHaveBeenCalledWith(true);
    expect(component.recordatoriosActivos()).toBeTrue();
    expect(component.mensaje()).toBe('Recordatorios por correo activados.');
    expect(component.guardandoRecordatorios()).toBeFalse();
  });

  it('revierte el estado si no se pueden guardar recordatorios', () => {
    recordatorios.actualizar.and.returnValue(throwError(() => new Error('falló')));
    component.recordatoriosActivos.set(false);
    component.cambiarRecordatorios({ target: { checked: true } } as unknown as Event);
    expect(component.recordatoriosActivos()).toBeFalse();
    expect(component.errorRecordatorios()).toContain('No se pudo guardar');
  });

  it('vincula Google correctamente', () => {
    component.vincularConGoogle('credential');
    expect(auth.vincularGoogle).toHaveBeenCalledWith('credential');
    expect(component.mensaje()).toBe('Google quedó vinculado a tu cuenta.');
    expect(component.vinculando()).toBeFalse();
  });

  it('evita una vinculación si ya está procesando o no hay sesión', () => {
    component.vinculando.set(true);
    component.vincularConGoogle('credential');
    expect(auth.vincularGoogle).not.toHaveBeenCalled();
    component.vinculando.set(false);
    auth.isLoggedIn.and.returnValue(false);
    component.vincularConGoogle('credential');
    expect(auth.vincularGoogle).not.toHaveBeenCalled();
  });

  it('muestra el error de Google cuando falla la vinculación', () => {
    auth.vincularGoogle.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 409, error: { detail: 'Conflicto de identidad' } })
    ));
    component.vincularConGoogle('credential');
    expect(component.error()).toContain('Conflicto de identidad');
    expect(component.vinculando()).toBeFalse();
  });

  it('valida campos vacíos, longitud, confirmación y contraseña repetida', () => {
    component.cambiarPassword();
    expect(component.errorPassword()).toBe('Completa todos los campos.');

    component.passwordActual.set('actual');
    component.passwordNueva.set('corta');
    component.confirmarPassword.set('corta');
    component.cambiarPassword();
    expect(component.errorPassword()).toContain('entre 8 y 72');

    component.passwordNueva.set('NuevaClave123');
    component.confirmarPassword.set('DistintaClave123');
    component.cambiarPassword();
    expect(component.errorPassword()).toContain('no coinciden');

    component.passwordNueva.set('actual');
    component.confirmarPassword.set('actual');
    component.cambiarPassword();
    expect(component.errorPassword()).toContain('diferente');
    expect(auth.cambiarPassword).not.toHaveBeenCalled();
  });

  it('cambia la contraseña y limpia los campos al tener éxito', () => {
    component.passwordActual.set('ViejaClave123');
    component.passwordNueva.set('NuevaClave123');
    component.confirmarPassword.set('NuevaClave123');
    component.cambiarPassword();
    expect(auth.cambiarPassword).toHaveBeenCalledWith('ViejaClave123', 'NuevaClave123');
    expect(component.passwordActual()).toBe('');
    expect(component.passwordNueva()).toBe('');
    expect(component.confirmarPassword()).toBe('');
    expect(component.mensajePassword()).toContain('actualizó correctamente');
    expect(component.cambiandoPassword()).toBeFalse();
  });

  it('maneja errores de contraseña por estado HTTP', () => {
    auth.cambiarPassword.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 401 })
    ));
    component.passwordActual.set('ViejaClave123');
    component.passwordNueva.set('NuevaClave123');
    component.confirmarPassword.set('NuevaClave123');
    component.cambiarPassword();
    expect(component.errorPassword()).toContain('sesión no es válida');

    auth.cambiarPassword.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Error personalizado' } })
    ));
    component.cambiandoPassword.set(false);
    component.passwordActual.set('ViejaClave123');
    component.passwordNueva.set('NuevaClave123');
    component.confirmarPassword.set('NuevaClave123');
    component.cambiarPassword();
    expect(component.errorPassword()).toBe('Error personalizado');
  });
});

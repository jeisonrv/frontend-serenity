import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { LoginComponent } from './login.component';
import { ConsentService } from '../../../core/services/consent.service';

describe('LoginComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let consent: jasmine.SpyObj<ConsentService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'iniciarConGoogle', 'getRole']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'getCurrentNavigation']);
    router.getCurrentNavigation.and.returnValue(null);
    consent = jasmine.createSpyObj<ConsentService>('ConsentService', ['consultar']);
    Object.defineProperty(consent, 'revisionPendiente', { value: signal(false) });
    consent.consultar.and.returnValue(of({
      termsAccepted: true,
      termsAcceptedAt: null,
      termsVersion: '1',
      currentTermsVersion: '1',
      sensitiveDataConsentActive: false
    }));
  });

  it('valida correo y contraseña sin llamar al servicio', () => {
    const component = new LoginComponent(new FormBuilder(), auth, router, new LoggerService(), consent);
    component.enviar();
    expect(component.form.invalid).toBeTrue();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('inicia sesión y navega según el rol', () => {
    auth.login.and.returnValue(of({ token: 'token', usuario: { id: 1, username: 'ana', email: 'a@b.co', nivel: 1, xp: 0, rol: 'OYENTE' } }));
    const component = new LoginComponent(new FormBuilder(), auth, router, new LoggerService(), consent);
    component.form.setValue({ correo: 'ana@example.com', contrasena: 'clave' });
    component.enviar();
    expect(auth.login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'clave' });
    expect(router.navigate).toHaveBeenCalledWith(['/oyente']);
  });

  it('navega al panel de moderación para el rol MODERADOR', () => {
    auth.login.and.returnValue(of({
      token: 'token',
      usuario: {
        id: 2,
        username: 'moderador',
        email: 'moderador.serenity@example.com',
        nivel: 1,
        xp: 0,
        rol: 'MODERADOR'
      }
    }));
    const component = new LoginComponent(new FormBuilder(), auth, router, new LoggerService(), consent);
    component.form.setValue({
      correo: 'moderador.serenity@example.com',
      contrasena: 'clave'
    });
    component.enviar();
    expect(router.navigate).toHaveBeenCalledWith(['/moderacion']);
  });

  it('expone un mensaje cuando falla el inicio de sesión', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 401, error: { mensaje: 'Credenciales inválidas' } })));
    const component = new LoginComponent(new FormBuilder(), auth, router, new LoggerService(), consent);
    component.form.setValue({ correo: 'ana@example.com', contrasena: 'incorrecta' });
    component.enviar();
    expect(component.error()).toBeTruthy();
    expect(component.cargando()).toBeFalse();
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RecuperarPasswordComponent } from './recuperar-password.component';

describe('RecuperarPasswordComponent', () => {
  let component: RecuperarPasswordComponent;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['solicitarRecuperacion']);
    auth.solicitarRecuperacion.and.returnValue(of(void 0));
    component = new RecuperarPasswordComponent(auth);
  });

  it('no envía el formulario si el correo está vacío o es inválido', () => {
    component.enviar();
    expect(auth.solicitarRecuperacion).not.toHaveBeenCalled();
    expect(component.form.controls.correo.touched).toBeTrue();
    component.form.controls.correo.setValue('correo-no-valido');
    component.enviar();
    expect(auth.solicitarRecuperacion).not.toHaveBeenCalled();
  });

  it('envía el correo válido y muestra el mensaje de privacidad', () => {
    component.form.controls.correo.setValue('persona@example.com');
    component.enviar();
    expect(auth.solicitarRecuperacion).toHaveBeenCalledWith('persona@example.com');
    expect(component.mensaje()).toContain('Si existe una cuenta');
    expect(component.cargando()).toBeFalse();
  });

  it('muestra un mensaje de conexión si la solicitud falla con estado cero', () => {
    auth.solicitarRecuperacion.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 0 })
    ));
    component.form.controls.correo.setValue('persona@example.com');
    component.enviar();
    expect(component.error()).toContain('No pudimos conectar');
    expect(component.cargando()).toBeFalse();
  });

  it('muestra un mensaje genérico para un error del servidor', () => {
    auth.solicitarRecuperacion.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500 })
    ));
    component.form.controls.correo.setValue('persona@example.com');
    component.enviar();
    expect(component.error()).toContain('Inténtalo de nuevo más tarde');
  });

  it('ignora un envío duplicado mientras está cargando', () => {
    component.form.controls.correo.setValue('persona@example.com');
    component.cargando.set(true);
    component.enviar();
    expect(auth.solicitarRecuperacion).not.toHaveBeenCalled();
  });
});

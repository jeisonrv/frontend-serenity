import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RestablecerPasswordComponent } from './restablecer-password.component';

describe('RestablecerPasswordComponent', () => {
  let component: RestablecerPasswordComponent;
  let auth: jasmine.SpyObj<AuthService>;

  function crearComponente(token: string): void {
    const route = {
      snapshot: { queryParamMap: { get: () => token } }
    } as unknown as ActivatedRoute;
    component = new RestablecerPasswordComponent(route, auth);
  }

  function rellenarFormulario(nueva = 'NuevaClave123', confirmar = nueva): void {
    component.form.controls.passwordNueva.setValue(nueva);
    component.form.controls.confirmarPassword.setValue(confirmar);
  }

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['restablecerPassword']);
    auth.restablecerPassword.and.returnValue(of(void 0));
    crearComponente('token-valido');
  });

  it('informa si el enlace no contiene token', () => {
    crearComponente('');
    expect(component.error()).toContain('no contiene un token');
    component.enviar();
    expect(component.error()).toContain('no es válido');
    expect(auth.restablecerPassword).not.toHaveBeenCalled();
  });

  it('marca los controles si el formulario no es válido', () => {
    rellenarFormulario('corta', 'corta');
    component.enviar();
    expect(component.form.controls.passwordNueva.touched).toBeTrue();
    expect(auth.restablecerPassword).not.toHaveBeenCalled();
  });

  it('valida que las contraseñas coincidan', () => {
    rellenarFormulario('NuevaClave123', 'OtraClave123');
    component.enviar();
    expect(component.error()).toBe('Las contraseñas no coinciden.');
    expect(auth.restablecerPassword).not.toHaveBeenCalled();
  });

  it('restablece la contraseña y limpia el formulario al tener éxito', () => {
    rellenarFormulario();
    component.enviar();
    expect(auth.restablecerPassword).toHaveBeenCalledWith('token-valido', 'NuevaClave123');
    expect(component.mensaje()).toContain('se actualizó');
    expect(component.form.controls.passwordNueva.value).toBeNull();
    expect(component.cargando()).toBeFalse();
  });

  it('maneja enlaces inválidos o caducados', () => {
    auth.restablecerPassword.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 400 })
    ));
    rellenarFormulario();
    component.enviar();
    expect(component.error()).toContain('caducado');
    expect(component.cargando()).toBeFalse();
  });

  it('maneja errores de conexión', () => {
    auth.restablecerPassword.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 0 })
    ));
    rellenarFormulario();
    component.enviar();
    expect(component.error()).toContain('No pudimos conectar');
  });

  it('maneja errores inesperados del servidor', () => {
    auth.restablecerPassword.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500 })
    ));
    rellenarFormulario();
    component.enviar();
    expect(component.error()).toContain('No se pudo restablecer');
  });
});

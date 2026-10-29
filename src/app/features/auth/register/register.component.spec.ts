import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['registrar', 'iniciarConGoogle']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  it('valida campos, longitud y aceptación de términos', () => {
    const component = new RegisterComponent(new FormBuilder(), auth, router);
    component.enviar();
    expect(component.form.invalid).toBeTrue();
    expect(auth.registrar).not.toHaveBeenCalled();
  });

  it('registra y navega al login con confirmación', () => {
    auth.registrar.and.returnValue(of({ id: 1, username: 'ana', email: 'ana@example.com', nivel: 1, xp: 0 }));
    const component = new RegisterComponent(new FormBuilder(), auth, router);
    component.form.setValue({ nombreUsuario: 'ana', correo: 'ana@example.com', contrasena: 'secreto', aceptaTerminos: true });
    component.enviar();
    expect(auth.registrar).toHaveBeenCalledWith({ username: 'ana', email: 'ana@example.com', password: 'secreto' });
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { state: { authSuccess: jasmine.any(String) } });
  });

  it('muestra error y libera el estado de carga si falla el registro', () => {
    auth.registrar.and.returnValue(throwError(() => ({ status: 409, error: { mensaje: 'Correo existente' } })));
    const component = new RegisterComponent(new FormBuilder(), auth, router);
    component.form.setValue({ nombreUsuario: 'ana', correo: 'ana@example.com', contrasena: 'secreto', aceptaTerminos: true });
    component.enviar();
    expect(component.error()).toBeTruthy();
    expect(component.cargando()).toBeFalse();
  });
});

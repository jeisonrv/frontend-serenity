import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  const usuario = {
    id: 12, username: 'jeison', email: 'jeison@example.com',
    nivel: 1, xp: 0
  };

  it('envía credenciales de acceso y guarda la sesión', () => {
    service.login({ email: 'jeison@example.com', password: 'clave' }).subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({ token: 'token-prueba', usuario });
    expect(localStorage.getItem('serenity_token')).toBe('token-prueba');
    expect(service.usuario()).toEqual(jasmine.objectContaining({
      ...usuario,
      googleVinculado: false
    }));
    expect(service.usuario()?.googleVinculado).toBeFalse();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.autenticado()).toBeTrue();
  });

  it('inicia sesión con Google y conserva la sesión recibida', () => {
    service.iniciarConGoogle('credential').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/google');
    expect(request.request.body).toEqual({ credential: 'credential' });
    request.flush({ token: 'google-token', usuario: { ...usuario, googleVinculado: true } });
    expect(service.token).toBe('google-token');
    expect(service.usuario()?.googleVinculado).toBeTrue();
  });

  it('solicita vincular Google a la sesión actual', () => {
    service.vincularGoogle('credential').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/vincular');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ credential: 'credential' });
    request.flush(null);
  });

  it('registra un usuario', () => {
    const datos = { username: 'nuevo', email: 'nuevo@example.com', password: 'password' };
    const registro = { ...datos, acceptTerms: true, acceptSensitiveData: false };
    let registrado: { googleVinculado?: boolean } | undefined;
    service.registrar(registro).subscribe((respuesta) => registrado = respuesta);
    const request = http.expectOne(environment.apiUrl + '/auth/registro');
    expect(request.request.body).toEqual(registro);
    request.flush({ ...usuario, googleVinculado: true });
    expect(registrado?.googleVinculado).toBeTrue();
  });

  it('cambia la contraseña con la contraseña actual y la nueva', () => {
    service.cambiarPassword('anterior', 'nueva1234').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/cambiar-password');
    expect(request.request.body).toEqual({
      passwordActual: 'anterior',
      passwordNueva: 'nueva1234'
    });
    request.flush(null);
  });

  it('crea una contraseña para una cuenta sin contraseña', () => {
    service.crearPassword('nueva1234').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/crear-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ passwordNueva: 'nueva1234' });
    request.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('carga el perfil actual y actualiza la sesión local', () => {
    localStorage.setItem('serenity_token', 'token');
    service.actualizarUsuario(usuario);
    service.refrescarPerfil().subscribe();
    const request = http.expectOne(environment.apiUrl + '/usuarios/me');
    expect(request.request.method).toBe('GET');
    request.flush({ ...usuario, googleVinculado: true, tienePassword: false });

    expect(service.usuario()).toEqual({
      ...usuario,
      googleVinculado: true,
      tienePassword: false
    });
    expect(JSON.parse(localStorage.getItem('serenity_usuario') || '{}')).toEqual(service.usuario());
    expect(service.token).toBe('token');
  });

  it('no modifica la sesión si falla la carga del perfil', () => {
    localStorage.setItem('serenity_token', 'token');
    service.actualizarUsuario(usuario);
    let error: unknown;
    service.refrescarPerfil().subscribe({ error: (e) => error = e });
    const request = http.expectOne(environment.apiUrl + '/usuarios/me');
    request.flush('falló', { status: 401, statusText: 'Unauthorized' });

    expect(error).toEqual(jasmine.anything());
    expect(service.token).toBe('token');
    expect(service.usuario()).toEqual(usuario);
    expect(JSON.parse(localStorage.getItem('serenity_usuario') || '{}')).toEqual(usuario);
  });

  it('solicita recuperación de contraseña', () => {
    service.solicitarRecuperacion('jeison@example.com').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/olvide-password');
    expect(request.request.body).toEqual({ correo: 'jeison@example.com' });
    request.flush(null);
  });

  it('restablece la contraseña usando el token', () => {
    service.restablecerPassword('token', 'nueva1234').subscribe();
    const request = http.expectOne(environment.apiUrl + '/auth/restablecer-password');
    expect(request.request.body).toEqual({ token: 'token', passwordNueva: 'nueva1234' });
    request.flush(null);
  });

  it('actualiza los datos del usuario y los persiste', () => {
    service.actualizarUsuario(usuario);
    expect(service.usuario()).toEqual(usuario);
    expect(JSON.parse(localStorage.getItem('serenity_usuario') || '{}')).toEqual(usuario);
  });

  it('elimina token y usuario al cerrar sesión', () => {
    localStorage.setItem('serenity_token', 'token');
    localStorage.setItem('serenity_usuario', JSON.stringify(usuario));
    service.cerrarSesion();
    expect(service.token).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('rechaza una sesión cuyo JWT expiró', () => {
    const payload = btoa(JSON.stringify({ exp: 1, rol: 'OYENTE' }));
    localStorage.setItem('serenity_token', `header.${payload}.firma`);
    localStorage.setItem('serenity_usuario', JSON.stringify({ ...usuario, rol: 'OYENTE' }));
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.token).toBeNull();
  });
});

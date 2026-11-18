import { HttpErrorResponse } from '@angular/common/http';
import { mensajeGoogleError } from './mensaje-google-error';

function errorHttp(status: number, error: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('mensajeGoogleError', () => {
  it('ofrece instrucciones de acceso ante conflicto 409 sin detalle', () => {
    expect(mensajeGoogleError(errorHttp(409, {}), 'acceso'))
      .toBe('Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.');
  });

  it('ofrece instrucciones de vinculación ante conflicto 409 sin detalle', () => {
    expect(mensajeGoogleError(errorHttp(409, {}), 'vinculacion'))
      .toBe('Esta cuenta de Google ya está vinculada a otro usuario.');
  });

  it('usa la instrucción requerida ante un conflicto de acceso', () => {
    expect(mensajeGoogleError(errorHttp(409, { detail: 'Cuenta en conflicto' }), 'acceso'))
      .toBe('Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.');
  });

  it('usa el código de cuenta Google no vinculada para acceso', () => {
    expect(mensajeGoogleError(errorHttp(409, { codigo: 'GOOGLE_ACCOUNT_NOT_LINKED' }), 'acceso'))
      .toBe('Ya existe una cuenta con este correo. Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.');
  });

  it('muestra la instrucción de vinculación aunque el backend envíe otro detalle', () => {
    const detalle = 'Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.';
    expect(mensajeGoogleError(errorHttp(409, { detail: detalle }), 'acceso')).toBe(detalle);
  });

  it('usa el mensaje claro de vinculación ante un conflicto 409', () => {
    const detalle = 'La identidad está vinculada a otra cuenta.';
    expect(mensajeGoogleError(errorHttp(409, { detail: detalle }), 'vinculacion'))
      .toBe('Esta cuenta de Google ya está vinculada a otro usuario.');
  });

  it('devuelve un mensaje específico para HTTP 400', () => {
    expect(mensajeGoogleError(errorHttp(400), 'acceso'))
      .toBe('La solicitud de Google no es válida. Inténtalo de nuevo.');
  });

  it('devuelve un mensaje específico para HTTP 401', () => {
    expect(mensajeGoogleError(errorHttp(401), 'acceso'))
      .toBe('La credencial de Google no es válida o expiró. Inténtalo de nuevo.');
  });

  it('devuelve un mensaje específico para HTTP 503', () => {
    expect(mensajeGoogleError(errorHttp(503), 'acceso'))
      .toBe('El acceso con Google no está disponible en este momento.');
  });

  it('devuelve un mensaje específico si falla la conexión', () => {
    expect(mensajeGoogleError(errorHttp(0, { message: 'Failed to fetch' }), 'acceso'))
      .toBe('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
  });

  it('prefiere el mensaje útil del backend para otros estados', () => {
    expect(mensajeGoogleError(errorHttp(500, { message: 'Servicio temporalmente no disponible' }), 'acceso'))
      .toBe('Servicio temporalmente no disponible');
  });

  it('usa el mensaje general de acceso si el servidor no aporta detalle', () => {
    expect(mensajeGoogleError(errorHttp(500), 'acceso'))
      .toBe('No se pudo iniciar sesión con Google.');
  });

  it('usa el mensaje general de vinculación si el servidor no aporta detalle', () => {
    expect(mensajeGoogleError(errorHttp(500), 'vinculacion'))
      .toBe('No se pudo vincular Google a tu cuenta.');
  });
});

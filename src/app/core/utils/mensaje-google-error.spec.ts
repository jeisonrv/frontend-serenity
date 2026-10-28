import { HttpErrorResponse } from '@angular/common/http';
import { mensajeGoogleError } from './mensaje-google-error';

function errorHttp(status: number, error: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('mensajeGoogleError', () => {
  it('ofrece instrucciones de acceso ante conflicto 409 sin detalle', () => {
    expect(mensajeGoogleError(errorHttp(409, {}), 'acceso'))
      .toBe('Inicia sesión con tu método actual y vincula Google desde Mi cuenta.');
  });

  it('ofrece instrucciones de vinculación ante conflicto 409 sin detalle', () => {
    expect(mensajeGoogleError(errorHttp(409, {}), 'vinculacion'))
      .toBe('Esta identidad de Google podría estar vinculada a otra cuenta.');
  });

  it('añade instrucciones cuando el detalle del conflicto no las contiene', () => {
    expect(mensajeGoogleError(errorHttp(409, { detail: 'Cuenta en conflicto' }), 'acceso'))
      .toBe('Cuenta en conflicto Inicia sesión con tu método actual y vincula Google desde Mi cuenta.');
  });

  it('evita repetir las instrucciones ya incluidas en el detalle', () => {
    const detalle = 'Inicia sesión con tu método actual y vincula Google desde Mi cuenta.';
    expect(mensajeGoogleError(errorHttp(409, { detail: detalle }), 'acceso')).toBe(detalle);
  });

  it('conserva el detalle que indica que la identidad ya está vinculada', () => {
    const detalle = 'La identidad está vinculada a otra cuenta.';
    expect(mensajeGoogleError(errorHttp(409, { detail: detalle }), 'vinculacion')).toBe(detalle);
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

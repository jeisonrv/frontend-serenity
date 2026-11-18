import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from './mensaje-error';

export type OperacionGoogle = 'acceso' | 'vinculacion';

export function mensajeGoogleError(error: HttpErrorResponse, operacion: OperacionGoogle): string {
  const detalle = error.error?.detail ?? error.error?.message ?? error.error?.mensaje;
  const detalleBackend = typeof detalle === 'string' ? detalle.trim() : '';

  if (error.status === 409) {
    const instruccion = operacion === 'acceso'
      ? 'Inicia sesión con tu método actual y vincula Google desde Mi cuenta.'
      : 'Esta identidad de Google podría estar vinculada a otra cuenta.';
    if (!detalleBackend) return instruccion;
    const detalleNormalizado = detalleBackend.toLocaleLowerCase();
    const yaIncluyeOrientacion = operacion === 'acceso'
      ? detalleNormalizado.includes('inicia sesión') && detalleNormalizado.includes('vincula google')
      : detalleNormalizado.includes('vinculada');
    return yaIncluyeOrientacion ? detalleBackend : `${detalleBackend} ${instruccion}`;
  }

  const mensajePredeterminado = error.status === 400
    ? 'La solicitud de Google no es válida. Inténtalo de nuevo.'
    : error.status === 401
      ? 'La credencial de Google no es válida o expiró. Inténtalo de nuevo.'
      : error.status === 503
        ? 'El acceso con Google no está disponible en este momento.'
        : operacion === 'acceso'
          ? 'No se pudo iniciar sesión con Google.'
          : 'No se pudo vincular Google a tu cuenta.';

  return mensajeError(error, mensajePredeterminado);
}

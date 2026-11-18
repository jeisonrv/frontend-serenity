import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from './mensaje-error';

export type OperacionGoogle = 'acceso' | 'vinculacion';

export function mensajeGoogleError(error: HttpErrorResponse, operacion: OperacionGoogle): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
  }

  const detalle = error.error?.detail ?? error.error?.message ?? error.error?.mensaje;
  const detalleBackend = typeof detalle === 'string' ? detalle.trim() : '';

  if (error.status === 409) {
    if (operacion === 'acceso') {
      if (error.error?.codigo === 'GOOGLE_ACCOUNT_NOT_LINKED') {
        return 'Ya existe una cuenta con este correo. Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.';
      }
      return 'Inicia sesión con tu contraseña y vincula Google desde Mi cuenta.';
    }

    return 'Esta cuenta de Google ya está vinculada a otro usuario.';
  }

  if (error.status === 401) {
    return 'La credencial de Google no es válida o expiró. Inténtalo de nuevo.';
  }
  if (error.status === 503) {
    return 'El acceso con Google no está disponible en este momento.';
  }

  const mensajePredeterminado = error.status === 400
    ? 'La solicitud de Google no es válida. Inténtalo de nuevo.'
    : operacion === 'acceso'
      ? 'No se pudo iniciar sesión con Google.'
      : 'No se pudo vincular Google a tu cuenta.';

  return mensajeError(error, mensajePredeterminado);
}

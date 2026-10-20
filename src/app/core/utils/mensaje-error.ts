import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(
  error: HttpErrorResponse,
  mensajePredeterminado: string
): string {
  // Spring ProblemDetail expone el mensaje principal en `detail`.
  const mensajeServidor = error.error?.detail ?? error.error?.message ?? error.error?.mensaje;

  if (typeof mensajeServidor === 'string' && mensajeServidor.trim()) {
    return mensajeServidor;
  }

  return mensajePredeterminado;
}

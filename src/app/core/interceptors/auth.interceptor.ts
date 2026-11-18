import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ConsentService } from '../services/consent.service';
import { mensajeError } from '../utils/mensaje-error';

// Adjunta el JWT (RF2, Spring Security + JWT) a cada petición al Backend
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const consent = inject(ConsentService);
  const authRequest = [
    '/api/auth/registro',
    '/api/auth/login',
    '/api/auth/google',
    '/api/auth/olvide-password',
    '/api/auth/restablecer-password'
  ].some((endpoint) => req.url.endsWith(endpoint));

  if (authRequest) return next(req);

  const token = auth.getToken();
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(catchError((error: unknown) => {
    if (
      error instanceof HttpErrorResponse &&
      error.status === 403 &&
      (error.error?.code === 'SENSITIVE_CONSENT_REQUIRED' ||
       error.error?.codigo === 'SENSITIVE_CONSENT_REQUIRED')
    ) {
      consent.marcarAutorizacionRequerida();
    }
    if (
      error instanceof HttpErrorResponse &&
      error.status === 401 &&
      !req.url.endsWith('/usuarios/me')
    ) {
      const mensaje = mensajeError(error, 'Tu sesión expiró. Inicia sesión nuevamente.');
      auth.logout();
      void router.navigate(['/login'], { state: { authError: mensaje } });
    }
    return throwError(() => error);
  }));
};

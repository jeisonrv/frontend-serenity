import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Adjunta el JWT (RF2, Spring Security + JWT) a cada petición al Backend
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/registro') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.token;

  if (!token) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};

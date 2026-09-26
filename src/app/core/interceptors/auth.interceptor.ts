import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Adjunta el JWT (RF2, Spring Security + JWT) a cada petición al Backend
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth/registro') || req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};

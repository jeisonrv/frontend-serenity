import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolSerenity } from '../models/usuario.model';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as RolSerenity[] | undefined;
  const rol = auth.usuario()?.rol;

  if (rol && roles?.includes(rol)) return true;
  if (rol === 'OYENTE') return router.createUrlTree(['/oyente']);
  if (rol === 'MODERADOR') return router.createUrlTree(['/moderacion']);
  if (rol === 'USUARIO') return router.createUrlTree(['/inicio']);
  return router.createUrlTree(['/login']);
};

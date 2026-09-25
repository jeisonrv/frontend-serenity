import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },

  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'ejercicios/respiracion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ejercicios/respiracion/respiracion.component').then((m) => m.RespiracionComponent)
  },
  {
    path: 'ejercicios/meditacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ejercicios/meditacion/meditacion.component').then((m) => m.MeditacionComponent)
  },
  {
    path: 'ejercicios/relajacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ejercicios/relajacion/relajacion.component').then((m) => m.RelajacionComponent)
  },
  {
    path: 'ejercicios/diario',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ejercicios/diario/diario.component').then((m) => m.DiarioComponent)
  },
  {
    path: 'jardin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/jardin/jardin.component').then((m) => m.JardinComponent)
  },
  {
    path: 'logros',
    canActivate: [authGuard],
    loadComponent: () => import('./features/logros/logros.component').then((m) => m.LogrosComponent)
  },
  {
    path: 'estadisticas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./features/chat/chat.component').then((m) => m.ChatComponent)
  },

  { path: '**', redirectTo: 'inicio' }
];

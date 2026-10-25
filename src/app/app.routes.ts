import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio'
  },

  {
    path: 'ayuda',
    loadComponent: () =>
        import('./features/ayuda/ayuda.component')
            .then((m) => m.AyudaComponent)
  },
  {
    path: 'terminos',
    loadComponent: () =>
        import('./features/terminos/terminos.component')
            .then((m) => m.TerminosComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
        import('./features/auth/login/login.component')
            .then((m) => m.LoginComponent)
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
        import('./features/auth/recuperar-password/recuperar-password.component')
            .then((m) => m.RecuperarPasswordComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
        import('./features/auth/register/register.component')
            .then((m) => m.RegisterComponent)
  },

  {
    path: 'cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./features/cuenta/cuenta.component')
            .then((m) => m.CuentaComponent)
  },

  {
    path: 'inicio',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/dashboard/dashboard.component')
            .then((m) => m.DashboardComponent)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/usuarios/usuarios.component')
            .then((m) => m.UsuariosComponent)
  },
  {
    path: 'ejercicios/respiracion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/ejercicios/respiracion/respiracion.component')
            .then((m) => m.RespiracionComponent)
  },
  {
    path: 'ejercicios/meditacion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/ejercicios/meditacion/meditacion.component')
            .then((m) => m.MeditacionComponent)
  },
  {
    path: 'ejercicios/relajacion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/ejercicios/relajacion/relajacion.component')
            .then((m) => m.RelajacionComponent)
  },
  {
    path: 'ejercicios/diario',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/ejercicios/diario/diario.component')
            .then((m) => m.DiarioComponent)
  },
  {
    path: 'jardin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/jardin/jardin.component')
            .then((m) => m.JardinComponent)
  },
  {
    path: 'logros',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/logros/logros.component')
            .then((m) => m.LogrosComponent)
  },
  {
    path: 'estadisticas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/estadisticas/estadisticas.component')
            .then((m) => m.EstadisticasComponent)
  },

  // Panel del oyente
  {
    path: 'oyente',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['OYENTE'] },
    loadComponent: () =>
        import('./features/oyente/panel-oyente.component')
            .then((m) => m.PanelOyenteComponent)
  },

  // Panel de moderación
  {
    path: 'moderacion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MODERADOR'] },
    loadComponent: () =>
        import('./features/moderacion/panel-moderacion.component')
            .then((m) => m.PanelModeracionComponent)
  },

  // Chat
  {
    path: 'chat/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['OYENTE'] },
    loadComponent: () =>
        import('./features/chat/chat.component')
            .then((m) => m.ChatComponent)
  },
  {
    path: 'chat',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USUARIO'] },
    loadComponent: () =>
        import('./features/chat/chat.component')
            .then((m) => m.ChatComponent)
  },

  {
    path: '**',
    redirectTo: 'inicio'
  }
];

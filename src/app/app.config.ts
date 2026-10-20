import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

interface RuntimeConfig {
  apiUrl: string;
  wsUrl: string;
  googleClientId?: string;
}

function initializeRuntimeConfig(): () => Promise<void> {
  return async () => {
    let response: Response;
    try {
      response = await fetch('/config.json', { cache: 'no-store' });
    } catch {
      if (!environment.production) return;
      throw new Error('No se pudo cargar la configuración de ejecución.');
    }

    if (response.status === 404 && !environment.production) {
      response = await fetch('/assets/config.dev.json', { cache: 'no-store' });
      if (response.status === 404) return;
    }
    if (!response.ok) throw new Error('No se pudo cargar la configuración de ejecución.');

    let config: Partial<RuntimeConfig>;
    try {
      config = await response.json() as Partial<RuntimeConfig>;
    } catch {
      if (!environment.production) return;
      throw new Error('La configuración de ejecución no es JSON válido.');
    }
    if (typeof config.apiUrl !== 'string' || typeof config.wsUrl !== 'string') {
      throw new Error('La configuración de ejecución no contiene API_URL y WS_URL válidas.');
    }

    const apiUrl = new URL(config.apiUrl);
    const wsUrl = new URL(config.wsUrl);
    if (!['http:', 'https:'].includes(apiUrl.protocol) || !['ws:', 'wss:'].includes(wsUrl.protocol)) {
      throw new Error('La configuración de ejecución contiene protocolos de URL no válidos.');
    }

    environment.apiUrl = config.apiUrl.replace(/\/+$/, '');
    environment.wsUrl = config.wsUrl.replace(/\/+$/, '');
    if (typeof config.googleClientId === 'string') {
      environment.googleClientId = config.googleClientId.trim();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: APP_INITIALIZER, useFactory: initializeRuntimeConfig, multi: true }
  ]
};


import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { LoggerService } from './core/services/logger.service';

interface RuntimeConfig {
  apiUrl: string;
  wsUrl: string;
  googleClientId?: string;
}
function removeTrailingSlashes(value: string): string {
  let end = value.length;

  while (end > 0 && value[end - 1] === '/') {
    end--;
  }

  return value.slice(0, end);
}

async function loadRuntimeConfig(logger: LoggerService): Promise<void> {
  let config: Partial<RuntimeConfig> | null = null;

  const configPaths = environment.production
      ? ['/config.json']
      : ['/config.json', '/assets/config.dev.json'];

  for (const path of configPaths) {
    try {
      const response = await fetch(path, { cache: 'no-store' });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        throw new Error(
            `No se pudo cargar ${path}. Estado HTTP: ${response.status}`
        );
      }

      config = await response.json() as Partial<RuntimeConfig>;
      break;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`El archivo ${path} no contiene JSON válido.`);
      }

      if (error instanceof TypeError && !environment.production) {
        continue;
      }

      throw error;
    }
  }

  if (!config) {
    if (environment.production) {
      throw new Error(
          'No se encontró config.json para la configuración de producción.'
      );
    }

    logger.warn(
        'No se encontró un archivo de configuración de ejecución.'
    );
    return;
  }

  if (
      typeof config.apiUrl !== 'string' ||
      typeof config.wsUrl !== 'string' ||
      !config.apiUrl.trim() ||
      !config.wsUrl.trim()
  ) {
    throw new Error(
        'La configuración debe incluir apiUrl y wsUrl válidas.'
    );
  }

  let apiUrl: URL;
  let wsUrl: URL;

  try {
    apiUrl = new URL(config.apiUrl);
    wsUrl = new URL(config.wsUrl);
  } catch {
    throw new Error(
        'apiUrl o wsUrl no contienen una URL válida.'
    );
  }

  if (!['http:', 'https:'].includes(apiUrl.protocol)) {
    throw new Error('apiUrl debe utilizar HTTP o HTTPS.');
  }

  if (!['ws:', 'wss:'].includes(wsUrl.protocol)) {
    throw new Error('wsUrl debe utilizar WS o WSS.');
  }

  environment.apiUrl = removeTrailingSlashes(config.apiUrl);
  environment.wsUrl = removeTrailingSlashes(config.wsUrl);

  const googleClientId =
      typeof config.googleClientId === 'string'
          ? config.googleClientId.trim()
          : '';

  environment.googleClientId = googleClientId;

  if (!googleClientId) {
    logger.warn(
        'Google OAuth no está configurado. ' +
        'El inicio de sesión con correo y contraseña seguirá disponible.'
    );
  }
}

function initializeRuntimeConfig(logger: LoggerService): () => Promise<void> {
  return () => loadRuntimeConfig(logger);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
        withInterceptors([authInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRuntimeConfig,
      deps: [LoggerService],
      multi: true
    }
  ]
};


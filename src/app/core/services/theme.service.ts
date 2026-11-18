import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

type SerenityTheme = 'light' | 'dark';

/**
 * Centraliza el tema de la aplicación. La preferencia se guarda localmente
 * para mantenerla entre visitas, sin depender del backend.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly oscuro = signal(false);
  private readonly browser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.browser = isPlatformBrowser(platformId);

    let temaInicial: SerenityTheme = 'light';
    if (this.browser) {
      try {
        const guardado = window.localStorage.getItem('serenity-theme');
        temaInicial = guardado === 'dark' || (!guardado && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark'
          : 'light';
      } catch {
        temaInicial = 'light';
      }
    }
    this.aplicar(temaInicial, false);
  }

  alternar(): void {
    this.aplicar(this.oscuro() ? 'light' : 'dark', true);
  }

  establecer(tema: SerenityTheme): void {
    this.aplicar(tema, true);
  }

  private aplicar(tema: SerenityTheme, guardar: boolean): void {
    const oscuro = tema === 'dark';
    this.oscuro.set(oscuro);
    this.document.documentElement.setAttribute('data-theme', tema);
    this.document.documentElement.style.colorScheme = tema;

    if (guardar && this.browser) {
      try {
        window.localStorage.setItem('serenity-theme', tema);
      } catch {
        // La interfaz sigue funcionando aunque el almacenamiento esté bloqueado.
      }
    }
  }
}

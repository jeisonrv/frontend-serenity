import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

export type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentityClient {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      renderButton(element: HTMLElement, options: {
        theme: 'outline';
        size: 'large';
        shape: 'rectangular';
        text: GoogleButtonText;
        locale: string;
        width: number;
      }): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityClient;
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private scriptPromise?: Promise<void>;
  private activeHandler: ((credential: string) => void) | null = null;
  private initializedClientId: string | null = null;

  constructor(private zone: NgZone) {}

  async renderButton(
    element: HTMLElement,
    text: GoogleButtonText,
    onCredential: (credential: string) => void
  ): Promise<() => void> {
    const clientId = environment.googleClientId.trim();
    if (!clientId) {
      throw new Error('Google no está configurado. Puedes continuar con correo y contraseña.');
    }

    await this.loadClient();
    const google = window.google;
    if (!google?.accounts?.id) {
      throw new Error('No se pudo inicializar el inicio de sesión de Google.');
    }

    this.activeHandler = onCredential;
    if (this.initializedClientId !== clientId) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (typeof response.credential !== 'string' || !response.credential) return;
          this.zone.run(() => this.activeHandler?.(response.credential!));
        }
      });
      this.initializedClientId = clientId;
    }
    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text,
      locale: 'es',
      width: 320
    });

    return () => {
      if (this.activeHandler === onCredential) this.activeHandler = null;
      element.replaceChildren();
    };
  }

  private loadClient(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = undefined;
        reject(new Error('No se pudo cargar el servicio de Google. Revisa tu conexión e inténtalo de nuevo.'));
      };
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}

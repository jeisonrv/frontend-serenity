import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { mensajeGoogleError } from '../../core/utils/mensaje-google-error';
import { GoogleIdentityButtonComponent } from '../../shared/google-identity-button/google-identity-button.component';
import { ConsentService } from '../../core/services/consent.service';
import { ConsentStatus } from '../../core/models/consent.model';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GoogleIdentityButtonComponent,
    RouterLink
  ],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.scss'
})
export class CuentaComponent implements OnInit {
  private readonly recordatoriosService = inject(RecordatoriosService);

  readonly vinculando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  readonly cargandoRecordatorios = signal(false);
  readonly guardandoRecordatorios = signal(false);
  readonly recordatoriosActivos = signal(false);
  readonly errorRecordatorios = signal<string | null>(null);

  // Estado del formulario de cambio de contraseña
  readonly passwordActual = signal('');
  readonly passwordNueva = signal('');
  readonly confirmarPassword = signal('');

  readonly cambiandoPassword = signal(false);
  readonly errorPassword = signal<string | null>(null);
  readonly mensajePassword = signal<string | null>(null);
  readonly consentimientos = signal<ConsentStatus | null>(null);
  readonly cargandoConsentimientos = signal(false);
  readonly guardandoConsentimiento = signal(false);
  readonly errorConsentimiento = signal<string | null>(null);
  readonly mensajeConsentimiento = signal<string | null>(null);
  readonly confirmaTerminos = signal(false);

  constructor(public auth: AuthService, private readonly consent: ConsentService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.cargarRecordatorios();
      this.cargarConsentimientos();
    }
  }

  cargarConsentimientos(): void {
    this.cargandoConsentimientos.set(true);
    this.consent.consultar().subscribe({
      next: status => { this.consentimientos.set(status); this.cargandoConsentimientos.set(false); },
      error: () => { this.errorConsentimiento.set('No se pudo consultar el estado de tus consentimientos.'); this.cargandoConsentimientos.set(false); }
    });
  }

  terminosPendientes(status: ConsentStatus): boolean {
    return status.termsAcceptancePending === true || !status.termsAccepted ||
      (!!status.currentTermsVersion && status.termsVersion !== status.currentTermsVersion);
  }

  aceptarTerminosVigentes(): void {
    if (this.guardandoConsentimiento() || !this.confirmaTerminos()) return;
    this.guardandoConsentimiento.set(true);
    this.errorConsentimiento.set(null);
    this.consent.aceptarTerminos().pipe(finalize(() => this.guardandoConsentimiento.set(false))).subscribe({
      next: status => {
        this.consentimientos.set(status);
        this.confirmaTerminos.set(false);
        this.mensajeConsentimiento.set('Términos y política aceptados. Ahora puedes elegir si autorizas el tratamiento de datos sensibles.');
      },
      error: () => this.errorConsentimiento.set('No se pudieron aceptar los términos vigentes. Inténtalo de nuevo.')
    });
  }

  cambiarAutorizacionSensibles(activar: boolean): void {
    if (this.guardandoConsentimiento()) return;
    const status = this.consentimientos();
    if (activar && (!status || this.terminosPendientes(status))) {
      this.errorConsentimiento.set('Primero debes aceptar los Términos y condiciones y confirmar que fuiste informado de la Política de Tratamiento de Datos.');
      return;
    }
    if (!activar && !window.confirm('Al revocar, Serenity dejará de guardar nuevos registros emocionales y las funciones de estado de ánimo, diario y progreso que dependen de ellos quedarán desactivadas. ¿Deseas continuar?')) return;
    this.guardandoConsentimiento.set(true);
    this.errorConsentimiento.set(null);
    const request = activar ? this.consent.autorizarDatosSensibles() : this.consent.revocarDatosSensibles();
    request.subscribe({
      next: () => { this.mensajeConsentimiento.set(activar ? 'Autorización activada.' : 'Autorización revocada.'); this.cargarConsentimientos(); this.guardandoConsentimiento.set(false); },
      error: () => { this.errorConsentimiento.set('No se pudo actualizar la autorización. Inténtalo de nuevo.'); this.guardandoConsentimiento.set(false); }
    });
  }

  cargarRecordatorios(): void {
    this.cargandoRecordatorios.set(true);
    this.errorRecordatorios.set(null);

    this.recordatoriosService.consultar()
        .pipe(
            finalize(() => this.cargandoRecordatorios.set(false))
        )
        .subscribe({
          next: (respuesta) => {
            this.recordatoriosActivos.set(respuesta.activo);
          },
          error: () => {
            this.errorRecordatorios.set(
                'No se pudo consultar la configuración de recordatorios.'
            );
          }
        });
  }

  cambiarRecordatorios(event: Event): void {
    const activo = (event.target as HTMLInputElement).checked;
    const estadoAnterior = this.recordatoriosActivos();

    this.recordatoriosActivos.set(activo);
    this.guardandoRecordatorios.set(true);
    this.errorRecordatorios.set(null);
    this.mensaje.set(null);

    this.recordatoriosService.actualizar(activo)
        .pipe(
            finalize(() => this.guardandoRecordatorios.set(false))
        )
        .subscribe({
          next: (respuesta) => {
            this.recordatoriosActivos.set(respuesta.activo);
            this.mensaje.set(
                respuesta.activo
                    ? 'Recordatorios por correo activados.'
                    : 'Recordatorios por correo desactivados.'
            );
          },
          error: () => {
            this.recordatoriosActivos.set(estadoAnterior);
            this.errorRecordatorios.set(
                'No se pudo guardar la preferencia. Inténtalo de nuevo.'
            );
          }
        });
  }

  vincularConGoogle(credential: string): void {
    if (this.vinculando() || !this.auth.isLoggedIn()) {
      return;
    }

    this.error.set(null);
    this.mensaje.set(null);
    this.vinculando.set(true);

    this.auth.vincularGoogle(credential)
        .pipe(
            finalize(() => this.vinculando.set(false))
        )
        .subscribe({
          next: () => {
            this.mensaje.set('Google quedó vinculado a tu cuenta.');
          },
          error: (err: HttpErrorResponse) => {
            this.error.set(
                mensajeGoogleError(err, 'vinculacion')
            );
          }
        });
  }

  // Cambiar la contraseña del usuario autenticado
  cambiarPassword(): void {
    this.errorPassword.set(null);
    this.mensajePassword.set(null);

    if (this.cambiandoPassword()) {
      return;
    }

    const actual = this.passwordActual();
    const nueva = this.passwordNueva();
    const confirmar = this.confirmarPassword();

    if (!actual.trim() || !nueva || !confirmar) {
      this.errorPassword.set('Completa todos los campos.');
      return;
    }

    if (nueva.length < 8 || nueva.length > 72) {
      this.errorPassword.set(
          'La nueva contraseña debe tener entre 8 y 72 caracteres.'
      );
      return;
    }

    if (nueva !== confirmar) {
      this.errorPassword.set(
          'La nueva contraseña y su confirmación no coinciden.'
      );
      return;
    }

    if (actual === nueva) {
      this.errorPassword.set(
          'La nueva contraseña debe ser diferente de la actual.'
      );
      return;
    }

    this.cambiandoPassword.set(true);

    this.auth.cambiarPassword(actual, nueva)
        .pipe(
            finalize(() => this.cambiandoPassword.set(false))
        )
        .subscribe({
          next: () => {
            this.passwordActual.set('');
            this.passwordNueva.set('');
            this.confirmarPassword.set('');
            this.mensajePassword.set(
                'Tu contraseña se actualizó correctamente.'
            );
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400 || err.status === 403) {
              this.errorPassword.set(
                  'No se pudo cambiar la contraseña. Comprueba tu contraseña actual y los datos ingresados.'
              );
            } else if (err.status === 401) {
              this.errorPassword.set(
                  'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.'
              );
            } else {
              this.errorPassword.set(
                  err.error?.message ||
                  'Ocurrió un error al cambiar la contraseña. Inténtalo de nuevo.'
              );
            }
          }
        });
  }
}


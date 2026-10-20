import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { mensajeGoogleError } from '../../core/utils/mensaje-google-error';
import { GoogleIdentityButtonComponent } from '../../shared/google-identity-button/google-identity-button.component';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, GoogleIdentityButtonComponent],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.scss'
})
export class CuentaComponent {
  readonly vinculando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  constructor(public auth: AuthService) {}

  vincularConGoogle(credential: string): void {
    if (this.vinculando() || !this.auth.isLoggedIn()) return;

    this.error.set(null);
    this.mensaje.set(null);
    this.vinculando.set(true);
    this.auth.vincularGoogle(credential)
      .pipe(finalize(() => this.vinculando.set(false)))
      .subscribe({
        next: () => this.mensaje.set('Google quedó vinculado a tu cuenta.'),
        error: (err: HttpErrorResponse) => this.error.set(mensajeGoogleError(err, 'vinculacion'))
      });
  }
}

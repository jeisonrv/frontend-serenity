import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { mensajeGoogleError } from '../../../core/utils/mensaje-google-error';
import { GoogleIdentityButtonComponent } from '../../../shared/google-identity-button/google-identity-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleIdentityButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.scss'
})
export class RegisterComponent {
  readonly cargando = signal(false);
  readonly googleCargando = signal(false);
  readonly error = signal<string | null>(null);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.form = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  enviar(): void {
    if (this.googleCargando() || this.cargando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.registrar({
      username: this.form.value.nombreUsuario!,
      email: this.form.value.correo!,
      password: this.form.value.contrasena!
    }).subscribe({
      next: () => this.router.navigate(['/login'], {
        state: { authSuccess: 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.' }
      }),
      error: (err: HttpErrorResponse) => {
        this.logger.error(err);
        this.error.set(mensajeError(err, 'Ocurrió un error al crear la cuenta.'));
        this.cargando.set(false);
      }
    });
  }

  iniciarConGoogle(credential: string): void {
    if (this.googleCargando() || this.cargando()) return;
    const terminos = this.form.get('aceptaTerminos');
    if (terminos?.value !== true) {
      terminos?.markAsTouched();
      this.error.set('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    this.error.set(null);
    this.googleCargando.set(true);
    this.auth.iniciarConGoogle(credential).subscribe({
      next: (response) => {
        const destino = response.usuario.rol === 'OYENTE'
          ? '/oyente'
          : response.usuario.rol === 'MODERADOR'
            ? '/moderacion'
            : '/inicio';
        void this.router.navigate([destino]);
        this.googleCargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeGoogleError(err, 'acceso'));
        this.googleCargando.set(false);
      }
    });
  }
}

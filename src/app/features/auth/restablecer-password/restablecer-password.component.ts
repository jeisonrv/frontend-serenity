import { Component, signal } from '@angular/core';
import { CommonModule, HttpErrorResponse } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer-password.component.html',
  styleUrl: './restablecer-password.component.scss'
})
export class RestablecerPasswordComponent {
  private readonly fb = new FormBuilder();
  readonly token: string;

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  readonly form = this.fb.group({
    passwordNueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmarPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('El enlace no contiene un token. Solicita un nuevo correo de recuperación.');
    }
  }

  enviar(): void {
    this.error.set(null);
    this.mensaje.set(null);

    if (!this.token) {
      this.error.set('El enlace no es válido. Solicita un nuevo correo de recuperación.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nueva = this.form.controls.passwordNueva.value ?? '';
    const confirmar = this.form.controls.confirmarPassword.value ?? '';

    if (nueva !== confirmar) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.cargando()) return;
    this.cargando.set(true);

    this.auth.restablecerPassword(this.token, nueva)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.mensaje.set('Tu contraseña se actualizó. Ya puedes iniciar sesión.');
          this.form.reset();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400 || err.status === 404) {
            this.error.set('El enlace no es válido o ha caducado. Solicita uno nuevo.');
          } else if (err.status === 0) {
            this.error.set('No pudimos conectar con Serenity. Inténtalo de nuevo.');
          } else {
            this.error.set('No se pudo restablecer la contraseña. Solicita un nuevo enlace e inténtalo otra vez.');
          }
        }
      });
  }
}

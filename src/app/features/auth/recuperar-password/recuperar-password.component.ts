import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.scss'
})
export class RecuperarPasswordComponent {
  private readonly fb = new FormBuilder();

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  readonly form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  constructor(private readonly auth: AuthService) {}

  enviar(): void {
    this.error.set(null);
    this.mensaje.set(null);

    if (this.form.invalid || this.cargando()) {
      this.form.markAllAsTouched();
      return;
    }

    const correo = this.form.controls.correo.value?.trim();
    if (!correo) return;

    this.cargando.set(true);

    this.auth.solicitarRecuperacion(correo)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => this.mensaje.set(
          'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.'
        ),
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 0
              ? 'No pudimos conectar con Serenity. Comprueba tu conexión e inténtalo de nuevo.'
              : 'No pudimos procesar la solicitud ahora. Inténtalo de nuevo más tarde.'
          );
        }
      });
  }
}

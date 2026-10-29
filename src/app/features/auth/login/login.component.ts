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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleIdentityButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly cargando = signal(false);
  readonly googleCargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmacion = signal<string | null>(null);

  form!: FormGroup;

 constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
    const mensajeSesion = this.router.getCurrentNavigation()?.extras.state?.['authError'];
    if (typeof mensajeSesion === 'string') this.error.set(mensajeSesion);
    const mensajeRegistro = this.router.getCurrentNavigation()?.extras.state?.['authSuccess'];
    if (typeof mensajeRegistro === 'string') this.confirmacion.set(mensajeRegistro);
  }

  enviar(): void {
    if (this.googleCargando() || this.cargando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);

    this.auth.login({
      email: this.form.value.correo!,
      password: this.form.value.contrasena!
    }).subscribe({
      next: (response) => {
        const destino = response.usuario.rol === 'OYENTE'
          ? '/oyente'
          : response.usuario.rol === 'MODERADOR'
            ? '/moderacion'
            : '/inicio';
        void this.router.navigate([destino]);
      },
      error: (err: HttpErrorResponse) => {
        this.logger.error(err);
        this.error.set(mensajeError(err, 'Ocurrió un error al iniciar sesión.'));
        this.cargando.set(false);
      }
    });
  }

  iniciarConGoogle(credential: string): void {
    if (this.googleCargando() || this.cargando()) return;
    this.error.set(null);
    this.googleCargando.set(true);
    this.auth.iniciarConGoogle(credential).subscribe({
      next: (response) => this.navegarSegunRol(response.usuario.rol),
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeGoogleError(err, 'acceso'));
        this.googleCargando.set(false);
      },
      complete: () => this.googleCargando.set(false)
    });
  }

  private navegarSegunRol(rol?: string): void {
    const destino = rol === 'OYENTE' ? '/oyente' : rol === 'MODERADOR' ? '/moderacion' : '/inicio';
    void this.router.navigate([destino]);
    this.googleCargando.set(false);
  }
}

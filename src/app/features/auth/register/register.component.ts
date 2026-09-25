import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.scss'
})
export class RegisterComponent {
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  enviar(): void {
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
      next: () => this.router.navigate(['/login']),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set(err.error?.mensaje ?? err.error?.message ?? 'Ocurrió un error al crear la cuenta.');
        this.cargando.set(false);
      }
    });
  }
}

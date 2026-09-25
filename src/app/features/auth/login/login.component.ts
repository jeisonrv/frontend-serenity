import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  form!: FormGroup;

 constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
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

    this.auth.login({
      email: this.form.value.correo!,
      password: this.form.value.contrasena!
    }).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set(err.error?.mensaje ?? err.error?.message ?? 'Ocurrió un error al iniciar sesión.');
        this.cargando.set(false);
      }
    });
  }
}

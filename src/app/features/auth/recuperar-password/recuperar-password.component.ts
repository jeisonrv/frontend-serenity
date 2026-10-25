import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

    enviar(): void {
        this.error.set(null);
        this.mensaje.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // Pendiente: conectar con el endpoint de recuperación del backend.
        this.error.set(
            'La recuperación todavía no está conectada al servidor.'
        );
    }
}

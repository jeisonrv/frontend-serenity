import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DiarioService } from '../../../core/services/diario.service';

// RF7: diario emocional — entradas guiadas (con prompt) o libres
const PROMPTS = [
  '¿Qué fue lo más pesado de hoy?',
  '¿Qué momento del día agradeces?',
  '¿Qué te gustaría soltar antes de dormir?',
  'Libre'
];

@Component({
  selector: 'app-diario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './diario.component.html',
  styleUrl: './diario.component.scss'
})
export class DiarioComponent {
  readonly prompts = PROMPTS;
  readonly promptSeleccionado = signal(PROMPTS[0]);
  readonly guardado = signal(false);
  readonly guardando = signal(false);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private diarioService: DiarioService
  ) {
    this.form = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  elegirPrompt(p: string): void {
    this.promptSeleccionado.set(p);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);

    this.diarioService
      .guardarEntrada({
        contenido: this.form.value.contenido!,
        tipoPrompt: this.promptSeleccionado()
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.guardado.set(true);
          this.form.reset();
        },
        error: () => this.guardando.set(false)
      });
  }
}
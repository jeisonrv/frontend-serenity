import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DiarioService } from '../../../core/services/diario.service';
import { EntradaDiario } from '../../../core/models/entrada-diario.model';

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
export class DiarioComponent implements OnInit {
  readonly prompts = PROMPTS;
  readonly promptSeleccionado = signal(PROMPTS[0]);
  readonly guardado = signal(false);
  readonly guardando = signal(false);
  readonly pestana = signal<'escribir' | 'entradas'>('escribir');
  readonly entradas = signal<EntradaDiario[]>([]);
  readonly cargandoEntradas = signal(false);
  readonly errorEntradas = signal('');
  readonly entradaSeleccionada = signal<EntradaDiario | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly editando = signal(false);
  readonly guardandoEdicion = signal(false);
  readonly errorDetalle = signal('');
  readonly confirmarEliminacion = signal(false);
  readonly eliminando = signal(false);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private diarioService: DiarioService
  ) {
    this.form = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarEntradas();
  }

  seleccionarPestana(pestana: 'escribir' | 'entradas'): void {
    this.pestana.set(pestana);
    if (pestana === 'entradas') this.cargarEntradas();
  }

  cargarEntradas(): void {
    this.cargandoEntradas.set(true);
    this.errorEntradas.set('');
    this.diarioService.listarEntradas().pipe(
      finalize(() => this.cargandoEntradas.set(false))
    ).subscribe({
      next: (entradas) => {
        this.entradas.set([...entradas].sort((a, b) =>
          new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        ));
      },
      error: (error: unknown) => {
        console.error(error);
        this.errorEntradas.set('No pudimos cargar tus entradas. Inténtalo de nuevo.');
      }
    });
  }

  abrirEntrada(entrada: EntradaDiario): void {
    this.entradaSeleccionada.set(null);
    this.cargandoDetalle.set(true);
    this.errorDetalle.set('');
    this.editando.set(false);
    this.confirmarEliminacion.set(false);
    this.diarioService.obtenerEntrada(entrada.idEntrada).subscribe({
      next: (detalle) => {
        this.entradaSeleccionada.set(detalle);
        this.form.patchValue({ contenido: detalle.contenido });
        this.promptSeleccionado.set(detalle.tipoPrompt);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.errorDetalle.set('No pudimos abrir esta entrada. Inténtalo de nuevo.');
        this.cargandoDetalle.set(false);
      }
    });
  }

  cerrarDetalle(): void {
    this.entradaSeleccionada.set(null);
    this.editando.set(false);
    this.confirmarEliminacion.set(false);
  }

  guardarEdicion(): void {
    const entrada = this.entradaSeleccionada();
    if (!entrada || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardandoEdicion.set(true);
    this.diarioService.actualizarEntrada(entrada.idEntrada, {
      contenido: this.form.value.contenido!,
      tipoPrompt: this.promptSeleccionado()
    }).subscribe({
      next: (actualizada) => {
        this.entradaSeleccionada.set(actualizada);
        this.editando.set(false);
        this.guardandoEdicion.set(false);
        this.cargarEntradas();
      },
      error: () => {
        this.errorDetalle.set('No pudimos guardar los cambios. Inténtalo de nuevo.');
        this.guardandoEdicion.set(false);
      }
    });
  }

  eliminarEntrada(): void {
    const entrada = this.entradaSeleccionada();
    if (!entrada) return;
    this.eliminando.set(true);
    this.diarioService.eliminarEntrada(entrada.idEntrada).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cerrarDetalle();
        this.cargarEntradas();
      },
      error: () => {
        this.errorDetalle.set('No pudimos eliminar la entrada. Inténtalo de nuevo.');
        this.eliminando.set(false);
      }
    });
  }

  elegirPrompt(p: string): void {
    this.promptSeleccionado.set(p);
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(fecha));
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
          this.cargarEntradas();
        },
        error: () => this.guardando.set(false)
      });
  }
}

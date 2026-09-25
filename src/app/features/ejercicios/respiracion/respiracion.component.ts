import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EjerciciosService } from '../../../core/services/ejercicios.service';

type Fase = 'inhala' | 'sostiene' | 'exhala' | 'reposo';

const DURACION_FASE: Record<Fase, number> = {
  inhala: 4,
  sostiene: 4,
  exhala: 6,
  reposo: 2
};
const ORDEN_FASES: Fase[] = ['inhala', 'sostiene', 'exhala', 'reposo'];
const CICLOS_OBJETIVO = 5;

// RF4: ejercicio de respiración guiada con temporizador por fases
@Component({
  selector: 'app-respiracion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './respiracion.component.html',
  styleUrl: './respiracion.component.scss'
})
export class RespiracionComponent implements OnDestroy {
  readonly fase = signal<Fase>('inhala');
  readonly segundosFase = signal(DURACION_FASE.inhala);
  readonly ciclo = signal(1);
  readonly cicloObjetivo = CICLOS_OBJETIVO;
  readonly enCurso = signal(false);
  readonly completado = signal(false);
  readonly segundosTotales = signal(0);

  private intervalo?: ReturnType<typeof setInterval>;

  constructor(private ejerciciosService: EjerciciosService) {}

  get etiquetaFase(): string {
    return { inhala: 'Inhala', sostiene: 'Sostén', exhala: 'Exhala', reposo: 'Reposa' }[this.fase()];
  }

  iniciar(): void {
    this.enCurso.set(true);
    this.completado.set(false);
    this.fase.set('inhala');
    this.segundosFase.set(DURACION_FASE.inhala);
    this.ciclo.set(1);
    this.segundosTotales.set(0);

    this.intervalo = setInterval(() => this.tick(), 1000);
  }

  detener(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
  }

  private tick(): void {
    this.segundosTotales.update((s) => s + 1);
    const restante = this.segundosFase() - 1;

    if (restante > 0) {
      this.segundosFase.set(restante);
      return;
    }

    const idxActual = ORDEN_FASES.indexOf(this.fase());
    const siguienteIdx = (idxActual + 1) % ORDEN_FASES.length;

    if (siguienteIdx === 0) {
      if (this.ciclo() >= this.cicloObjetivo) {
        this.finalizar();
        return;
      }
      this.ciclo.update((c) => c + 1);
    }

    const siguienteFase = ORDEN_FASES[siguienteIdx];
    this.fase.set(siguienteFase);
    this.segundosFase.set(DURACION_FASE[siguienteFase]);
  }

  private finalizar(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
    this.completado.set(true);

    this.ejerciciosService
      .registrarSesion({ tipoEjercicio: 'respiracion', duracion: this.segundosTotales() })
      .subscribe();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }
}

import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EjerciciosService } from '../../../core/services/ejercicios.service';

interface PasoRelajacion {
  grupoMuscular: string;
  fase: 'tension' | 'relajacion';
  segundos: number;
}

// RF6: relajación muscular progresiva — secuencia de grupos musculares
// con fases de tensión (5s) y relajación (10s), tal como valida la literatura de Jacobson.
const GRUPOS_MUSCULARES = ['Manos y antebrazos', 'Brazos', 'Hombros', 'Rostro', 'Abdomen', 'Piernas', 'Pies'];

function construirSecuencia(): PasoRelajacion[] {
  return GRUPOS_MUSCULARES.flatMap((grupo) => [
    { grupoMuscular: grupo, fase: 'tension' as const, segundos: 5 },
    { grupoMuscular: grupo, fase: 'relajacion' as const, segundos: 10 }
  ]);
}

@Component({
  selector: 'app-relajacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relajacion.component.html',
  styleUrl: './relajacion.component.scss'
})
export class RelajacionComponent implements OnDestroy {
  private readonly secuencia = construirSecuencia();

  readonly pasoActual = signal(0);
  readonly segundosPaso = signal(0);
  readonly enCurso = signal(false);
  readonly completado = signal(false);
  readonly segundosTotales = signal(0);

  private intervalo?: ReturnType<typeof setInterval>;

  constructor(private ejerciciosService: EjerciciosService) {}

  get paso(): PasoRelajacion {
    return this.secuencia[this.pasoActual()];
  }

  get progreso(): number {
    return Math.round(((this.pasoActual() + 1) / this.secuencia.length) * 100);
  }

  iniciar(): void {
    this.enCurso.set(true);
    this.completado.set(false);
    this.pasoActual.set(0);
    this.segundosTotales.set(0);
    this.segundosPaso.set(this.secuencia[0].segundos);

    this.intervalo = setInterval(() => this.tick(), 1000);
  }

  detener(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
  }

  private tick(): void {
    this.segundosTotales.update((s) => s + 1);
    const restante = this.segundosPaso() - 1;

    if (restante > 0) {
      this.segundosPaso.set(restante);
      return;
    }

    const siguiente = this.pasoActual() + 1;
    if (siguiente >= this.secuencia.length) {
      this.finalizar();
      return;
    }

    this.pasoActual.set(siguiente);
    this.segundosPaso.set(this.secuencia[siguiente].segundos);
  }

  private finalizar(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
    this.completado.set(true);

    this.ejerciciosService
      .registrarSesion({ tipoEjercicio: 'relajacion', duracion: this.segundosTotales() })
      .subscribe();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }
}

import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EjerciciosService } from '../../../core/services/ejercicios.service';

// RF5: sesión de meditación temporizada
@Component({
  selector: 'app-meditacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meditacion.component.html',
  styleUrl: './meditacion.component.scss'
})
export class MeditacionComponent implements OnDestroy {
  readonly duracionesDisponibles = [3, 5, 10, 15];
  readonly duracionMin = signal(5);
  readonly segundosRestantes = signal(0);
  readonly enCurso = signal(false);
  readonly completado = signal(false);

  private intervalo?: ReturnType<typeof setInterval>;

  constructor(private ejerciciosService: EjerciciosService) {}

  get minutosMostrados(): string {
    const m = Math.floor(this.segundosRestantes() / 60);
    const s = this.segundosRestantes() % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  iniciar(): void {
    this.completado.set(false);
    this.enCurso.set(true);
    this.segundosRestantes.set(this.duracionMin() * 60);

    this.intervalo = setInterval(() => {
      const restante = this.segundosRestantes() - 1;
      this.segundosRestantes.set(restante);
      if (restante <= 0) this.finalizar();
    }, 1000);
  }

  detener(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
  }

  private finalizar(): void {
    clearInterval(this.intervalo);
    this.enCurso.set(false);
    this.completado.set(true);

    this.ejerciciosService
      .registrarSesion({ tipoEjercicio: 'meditacion', duracion: this.duracionMin() * 60 })
      .subscribe();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }
}

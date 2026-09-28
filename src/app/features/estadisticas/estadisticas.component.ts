import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamificacionService } from '../../core/services/gamificacion.service';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Sesion } from '../../core/models/sesion.model';
import { AnimoService } from '../../core/services/animo.service';
import { EstadoAnimo } from '../../core/models/estado-animo.model';

// RF: estadísticas personales del historial de actividad
@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {
  readonly resumen = signal<{ totalSesiones: number; minutosTotales: number; racha: number } | null>(null);
  readonly historial = signal<Sesion[]>([]);
  readonly historialAnimo = signal<EstadoAnimo[]>([]);
  readonly cargando = signal(true);
  readonly cargandoAnimo = signal(true);

  constructor(
    private gamificacionService: GamificacionService,
    private ejerciciosService: EjerciciosService,
    private animoService: AnimoService
  ) {}

  ngOnInit(): void {
    this.gamificacionService.resumenEstadisticas().subscribe({
      next: (r) => this.resumen.set(r),
      error: () => {}
    });
    this.ejerciciosService.historial().subscribe({
      next: (h) => {
        this.historial.set(h);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
    this.animoService.historialAnimo().subscribe({
      next: (historial) => {
        this.historialAnimo.set(historial);
        this.cargandoAnimo.set(false);
      },
      error: () => this.cargandoAnimo.set(false)
    });
  }

  etiquetaAnimo(valor: EstadoAnimo['valor']): string {
    return ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'][valor - 1];
  }
}

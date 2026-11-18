import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamificacionService } from '../../core/services/gamificacion.service';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Sesion } from '../../core/models/sesion.model';

type Rango = '7d' | '30d';
interface DiaActividad {
  etiqueta: string;
  fecha: Date;
  sesiones: number;
  minutos: number;
  altura: number;
}

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
  readonly cargando = signal(true);
  readonly rango = signal<Rango>('7d');
  readonly error = signal('');

  readonly sesionesFiltradas = computed(() => {
    const dias = this.rango() === '7d' ? 7 : 30;
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - (dias - 1));
    return this.historial().filter(s => new Date(s.fechaCompletada) >= limite);
  });

  readonly totalPeriodo = computed(() => this.sesionesFiltradas().length);
  readonly minutosPeriodo = computed(() =>
    Math.round(this.sesionesFiltradas().reduce((total, s) => total + (Number(s.duracion) || 0), 0) / 60)
  );

  readonly barras = computed<DiaActividad[]>(() => {
    const dias = this.rango() === '7d' ? 7 : 30;
    const hoy = new Date();
    const resultados: DiaActividad[] = [];
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setHours(0, 0, 0, 0);
      fecha.setDate(fecha.getDate() - i);
      const sesiones = this.historial().filter(s => {
        const d = new Date(s.fechaCompletada);
        return d.getFullYear() === fecha.getFullYear() && d.getMonth() === fecha.getMonth() && d.getDate() === fecha.getDate();
      });
      resultados.push({
        etiqueta: dias === 7
          ? new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(fecha).replace('.', '')
          : String(fecha.getDate()),
        fecha,
        sesiones: sesiones.length,
        minutos: Math.round(sesiones.reduce((total, s) => total + (Number(s.duracion) || 0), 0) / 60),
        altura: 0
      });
    }
    const maximo = Math.max(1, ...resultados.map(d => d.sesiones));
    return resultados.map(d => ({ ...d, altura: d.sesiones ? Math.max(12, (d.sesiones / maximo) * 100) : 4 }));
  });

  readonly tiposActividad = computed(() => {
    const nombres: Record<string, string> = {
      respiracion: 'Respiración',
      meditacion: 'Meditación',
      relajacion: 'Relajación',
      diario: 'Diario emocional'
    };
    const conteo = new Map<string, number>();
    this.sesionesFiltradas().forEach(s => conteo.set(s.tipoEjercicio, (conteo.get(s.tipoEjercicio) ?? 0) + 1));
    return [...conteo.entries()]
      .map(([tipo, cantidad]) => ({ tipo, nombre: nombres[tipo] ?? tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  constructor(
    private gamificacionService: GamificacionService,
    private ejerciciosService: EjerciciosService
  ) {}

  ngOnInit(): void {
    this.gamificacionService.resumenEstadisticas().subscribe({
      next: r => this.resumen.set(r),
      error: () => this.error.set('No pudimos cargar el resumen general. Puedes consultar el historial si está disponible.')
    });
    this.ejerciciosService.historial().subscribe({
      next: h => {
        this.historial.set([...h].sort((a, b) =>
          new Date(b.fechaCompletada).getTime() - new Date(a.fechaCompletada).getTime()
        ));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tu historial. Inténtalo de nuevo más tarde.');
        this.cargando.set(false);
      }
    });
  }

  cambiarRango(rango: Rango): void {
    this.rango.set(rango);
  }

  porcentajeTipo(cantidad: number): number {
    const total = this.totalPeriodo();
    return total ? Math.round(cantidad / total * 100) : 0;
  }
}

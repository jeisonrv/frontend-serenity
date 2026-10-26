import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JardinService } from '../../core/services/jardin.service';
import { RegistroJardin } from '../../core/models/jardin.model';

type Etapa = 'semilla' | 'brote' | 'planta' | 'floracion';
interface PlantaVisual {
  registro: RegistroJardin;
  etapa: Etapa;
  simbolo: string;
  nombre: string;
  demora: string;
}

@Component({
  selector: 'app-jardin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jardin.component.html',
  styleUrl: './jardin.component.scss'
})
export class JardinComponent implements OnInit {
  readonly plantas = signal<RegistroJardin[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly filtro = signal<'todas' | 'flores' | 'brotes'>('todas');

  readonly plantasVisuales = computed<PlantaVisual[]>(() => {
    const datos = this.plantas();
    return datos.map((registro, indice) => {
      const etapa = this.etapaCrecimiento(registro.fechaRegistro);
      const tipo = (registro.tipoPlanta || '').toLowerCase();
      const simbolo = tipo.includes('flor') ? '🌼'
        : tipo.includes('lavanda') ? '🪻'
        : tipo.includes('girasol') ? '🌻'
        : tipo.includes('arbol') || tipo.includes('árbol') ? '🌳'
        : etapa === 'semilla' ? '🌰'
        : etapa === 'brote' ? '🌱'
        : etapa === 'planta' ? '🪴' : ['🌷', '🌼', '🌸', '🌻'][indice % 4];
      return {
        registro,
        etapa,
        simbolo,
        nombre: registro.tipoPlanta || 'Planta de serenidad',
        demora: 'delay-' + (indice % 5)
      };
    });
  });

  readonly plantasVisibles = computed(() => {
    const filtro = this.filtro();
    const plantas = this.plantasVisuales();
    if (filtro === 'flores') return plantas.filter(p => p.etapa === 'floracion' || p.simbolo.match(/🌼|🌻|🌷|🌸|🪻/));
    if (filtro === 'brotes') return plantas.filter(p => p.etapa === 'semilla' || p.etapa === 'brote');
    return plantas;
  });

  readonly totalPlantas = computed(() => this.plantas().length);
  readonly recompensas = computed(() => {
    const total = this.totalPlantas();
    return [
      { nombre: 'Primera semilla', descripcion: 'Tu jardín ya tiene un comienzo', icono: '🌱', desbloqueada: total >= 1 },
      { nombre: 'Pequeño brote', descripcion: 'Registra 3 momentos de cuidado', icono: '🌿', desbloqueada: total >= 3 },
      { nombre: 'Jardín en calma', descripcion: 'Registra 7 momentos de cuidado', icono: '🌷', desbloqueada: total >= 7 },
      { nombre: 'Rincón florecido', descripcion: 'Registra 15 momentos de cuidado', icono: '🌼', desbloqueada: total >= 15 }
    ];
  });
  readonly nivel = computed(() => {
    const total = this.totalPlantas();
    return total >= 15 ? 4 : total >= 7 ? 3 : total >= 3 ? 2 : total > 0 ? 1 : 0;
  });
  readonly progresoSiguiente = computed(() => {
    const total = this.totalPlantas();
    if (total >= 15) return 100;
    const inicio = total >= 7 ? 7 : total >= 3 ? 3 : 0;
    const fin = total >= 7 ? 15 : total >= 3 ? 7 : 3;
    return Math.round((total - inicio) / (fin - inicio) * 100);
  });
  readonly mensajeJardin = computed(() => {
    const total = this.totalPlantas();
    if (total === 0) return 'Todo gran jardín empieza con una semilla.';
    if (total < 3) return 'Tus primeras semillas ya encontraron un lugar donde crecer.';
    if (total < 7) return '¡Mira esos brotes! Cada momento que te dedicas cuenta.';
    if (total < 15) return 'Tu jardín va tomando forma, a tu propio ritmo.';
    return 'Tu jardín está lleno de vida. Gracias por seguir cultivando tu espacio.';
  });

  constructor(private jardinService: JardinService) {}

  ngOnInit(): void {
    this.cargarJardin();
  }

  cargarJardin(): void {
    this.cargando.set(true);
    this.error.set('');
    this.jardinService.obtenerJardin().subscribe({
      next: datos => {
        this.plantas.set(datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tu jardín. Comprueba tu conexión e inténtalo de nuevo.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(filtro: 'todas' | 'flores' | 'brotes'): void {
    this.filtro.set(filtro);
  }

  etapaCrecimiento(cantidadRegistros: number): Etapa {
    if (cantidadRegistros < 3) return 'semilla';
    if (cantidadRegistros < 7) return 'brote';
    if (cantidadRegistros < 15) return 'planta';
    return 'floracion';
  }
}

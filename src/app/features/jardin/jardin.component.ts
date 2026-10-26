import { Component, OnDestroy, OnInit, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JardinService } from '../../core/services/jardin.service';
import {
  DecoracionJardin,
  EstadoJardinInteractivo,
  EtapaPlanta,
  JardinInteractivoService,
  PlantaInteractiva,
  TipoPlanta
} from '../../core/services/jardin-interactivo.service';
import { RegistroJardin } from '../../core/models/jardin.model';

type FiltroPlantas = 'todas' | 'flores' | 'brotes';

interface PlantaVisual extends PlantaInteractiva {
  simbolo: string;
  demora: string;
}

interface RecompensaJardin {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueada: boolean;
}

@Component({
  selector: 'app-jardin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jardin.component.html',
  styleUrl: './jardin.component.scss'
})
export class JardinComponent implements OnInit, OnDestroy {
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly filtro = signal<FiltroPlantas>('todas');
  readonly plantaSeleccionadaId = signal<string | null>(null);
  readonly mensajeFeedback = signal('');
  readonly animacionRiego = signal(false);

  readonly estado: Signal<EstadoJardinInteractivo>;

  readonly plantasVisuales = computed<PlantaVisual[]>(() =>
    this.estado().plantas.map((planta, indice) => ({
      ...planta,
      simbolo: this.simboloPlanta(planta),
      demora: `delay-${indice % 5}`
    }))
  );

  readonly plantasVisibles = computed(() => {
    const filtro = this.filtro();
    const plantas = this.plantasVisuales();
    if (filtro === 'flores') return plantas.filter((planta) => planta.etapa === 'floracion');
    if (filtro === 'brotes') return plantas.filter((planta) => planta.etapa === 'semilla' || planta.etapa === 'brote');
    return plantas;
  });

  readonly plantaSeleccionada = computed(() =>
    this.estado().plantas.find((planta) => planta.id === this.plantaSeleccionadaId()) ?? null
  );

  readonly totalPlantas = computed(() => this.estado().plantas.length);
  readonly xp = computed(() => this.estado().xp);
  readonly nivel = computed(() => this.xp() >= 240 ? 4 : this.xp() >= 120 ? 3 : this.xp() >= 40 ? 2 : 1);

  readonly progresoSiguiente = computed(() => {
    const puntos = this.xp();
    if (puntos >= 240) return 100;
    if (puntos >= 120) return Math.round(((puntos - 120) / 120) * 100);
    if (puntos >= 40) return Math.round(((puntos - 40) / 80) * 100);
    return Math.round((puntos / 40) * 100);
  });

  readonly nombreSiguienteNivel = computed(() => {
    const puntos = this.xp();
    return puntos >= 240 ? 'Nivel máximo alcanzado' : puntos >= 120 ? 'Jardín sereno' : puntos >= 40 ? 'Jardín en crecimiento' : 'Primeros brotes';
  });

  readonly mensajeJardin = computed(() => {
    const total = this.totalPlantas();
    const actividades = this.estado().actividadesCompletadas;
    if (total === 0) return 'Todo gran jardín empieza con una semilla.';
    if (actividades === 0) return 'Tu jardín ya tiene un comienzo. Elige una planta y empieza a cuidarla.';
    if (actividades < 3) return 'Cada pausa que te regalas deja una nueva semilla de calma.';
    if (actividades < 7) return 'Tu jardín va tomando forma, a tu propio ritmo.';
    return 'Has cultivado muchos momentos para ti. ¡Mira todo lo que ha crecido!';
  });

  readonly recompensas = computed<RecompensaJardin[]>(() => {
    const estado = this.estado();
    return [
      {
        id: 'primera-pausa',
        nombre: 'Primera semilla',
        descripcion: 'Completa una actividad de bienestar.',
        icono: '🌱',
        desbloqueada: estado.actividadesCompletadas >= 1
      },
      {
        id: 'tres-pausas',
        nombre: 'Pequeños momentos',
        descripcion: 'Completa tres actividades para ti.',
        icono: '🪴',
        desbloqueada: estado.actividadesCompletadas >= 3
      },
      {
        id: 'primera-flor',
        nombre: 'Primera flor',
        descripcion: 'Cuida una planta hasta que florezca.',
        icono: '🌸',
        desbloqueada: estado.plantas.some((planta) => planta.etapa === 'floracion')
      },
      {
        id: 'jardin-completo',
        nombre: 'Jardín en calma',
        descripcion: 'Acumula 120 puntos de experiencia.',
        icono: '🌼',
        desbloqueada: estado.xp >= 120
      }
    ];
  });

  private feedbackTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly jardinService: JardinService,
    private readonly jardinInteractivo: JardinInteractivoService
  ) {
    this.estado = this.jardinInteractivo.estado;
  }

  ngOnInit(): void {
    this.jardinInteractivo.cargar();
    this.cargarJardin();
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
  }

  cargarJardin(): void {
    this.cargando.set(true);
    this.error.set('');
    this.jardinService.obtenerJardin().subscribe({
      next: (registros) => {
        const seguros = Array.isArray(registros)
          ? registros.filter((registro) => Boolean(registro && Number.isFinite(registro.idJardin)))
          : [];
        this.jardinInteractivo.sincronizarRegistros(seguros);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos sincronizar las plantas del servidor. Tu jardín de este dispositivo sigue disponible.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(filtro: FiltroPlantas): void {
    this.filtro.set(filtro);
  }

  seleccionarPlanta(planta: PlantaVisual): void {
    this.plantaSeleccionadaId.set(planta.id);
    this.mensajeFeedback.set('');
  }

  sembrarSemilla(): void {
    const id = this.jardinInteractivo.sembrarSemilla();
    this.plantaSeleccionadaId.set(id);
    this.filtro.set('todas');
    this.mensajeFeedback.set('Has sembrado una nueva semilla. Cuando quieras, puedes empezar a cuidarla.');
  }

  regarSeleccionada(): void {
    const planta = this.plantaSeleccionada();
    if (!planta) return;

    const etapa = this.jardinInteractivo.regarPlanta(planta.id);
    if (!etapa) {
      this.mensajeFeedback.set('Esta planta ya está en plena floración. Puedes personalizarla o elegir otra.');
      return;
    }

    this.animacionRiego.set(true);
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => this.animacionRiego.set(false), 800);
    this.mensajeFeedback.set(`¡Qué bien! ${planta.nombre} ahora está ${this.etiquetaEtapa(etapa).toLocaleLowerCase()}. +5 XP`);
  }

  cambiarTipo(tipo: TipoPlanta): void {
    const planta = this.plantaSeleccionada();
    if (!planta) return;
    this.jardinInteractivo.cambiarTipoPlanta(planta.id, tipo);
    this.mensajeFeedback.set('Tu planta tiene un nuevo aspecto. ¡El jardín es tuyo!');
  }

  cambiarDecoracion(decoracion: DecoracionJardin): void {
    if (!this.jardinInteractivo.seleccionarDecoracion(decoracion)) {
      const requisitos: Record<DecoracionJardin, number> = { natural: 0, mariposas: 40, faroles: 80, fuente: 140 };
      this.mensajeFeedback.set(`Esta decoración se desbloquea con ${requisitos[decoracion]} XP. Sigue a tu ritmo.`);
      return;
    }
    this.mensajeFeedback.set('¡Has cambiado el ambiente de tu jardín!');
  }

  alternarAmbiente(): void {
    this.jardinInteractivo.alternarAmbiente();
    this.mensajeFeedback.set(this.estado().modoNoche ? 'Modo noche activado. Respira y disfruta de la calma.' : 'Ha vuelto la luz del día a tu jardín.');
  }

  decoracionDesbloqueada(decoracion: DecoracionJardin): boolean {
    return this.jardinInteractivo.decoracionDesbloqueada(decoracion);
  }

  etiquetaEtapa(etapa: EtapaPlanta): string {
    const etiquetas: Record<EtapaPlanta, string> = {
      semilla: 'Semilla',
      brote: 'Brote nuevo',
      planta: 'En crecimiento',
      floracion: 'En floración'
    };
    return etiquetas[etapa];
  }

  private simboloPlanta(planta: PlantaInteractiva): string {
    if (planta.etapa === 'semilla') return '🌰';
    if (planta.etapa === 'brote') return '🌱';
    if (planta.etapa === 'planta') {
      return planta.tipo === 'girasol' ? '🌿' : planta.tipo === 'tulipan' ? '🪴' : '🪻';
    }
    return planta.tipo === 'girasol' ? '🌻' : planta.tipo === 'tulipan' ? '🌷' : '💐';
  }
}


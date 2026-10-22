import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnimoService } from '../../core/services/animo.service';
import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from '../../core/utils/mensaje-error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly opcionesAnimo = [
    { valor: 1, icono: '😞', etiqueta: 'Muy mal' },
    { valor: 2, icono: '🙁', etiqueta: 'Mal' },
    { valor: 3, icono: '😐', etiqueta: 'Neutral' },
    { valor: 4, icono: '🙂', etiqueta: 'Bien' },
    { valor: 5, icono: '😄', etiqueta: 'Muy bien' }
  ] as const;

  readonly animoSeleccionado = signal<1 | 2 | 3 | 4 | 5 | null>(null);
  readonly mensajeAnimo = signal('');
  readonly errorAnimo = signal('');
  readonly fechaHoy = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  readonly accesos = [
    {
      ruta: '/ejercicios/respiracion',
      titulo: 'Respiración consciente',
      desc: 'Recupera tu calma con una pausa guiada y sin prisas.',
      categoria: 'Calma y equilibrio',
      duracion: '5 min',
      imagen: 'assets/serenity-breathing.svg',
      alt: 'Ondas azules que representan la respiración'
    },
    {
      ruta: '/ejercicios/meditacion',
      titulo: 'Meditación guiada',
      desc: 'Vuelve al presente y encuentra un poco de espacio para ti.',
      categoria: 'Presencia plena',
      duracion: '5–15 min',
      imagen: 'assets/serenity-meditation.svg',
      alt: 'Persona meditando en un paisaje sereno'
    },
    {
      ruta: '/ejercicios/relajacion',
      titulo: 'Relajación muscular',
      desc: 'Suelta tensión poco a poco, de la cabeza a los pies.',
      categoria: 'Descanso corporal',
      duracion: '10 min',
      imagen: 'assets/serenity-relaxation.svg',
      alt: 'Manos que sostienen un corazón'
    },
    {
      ruta: '/ejercicios/diario',
      titulo: 'Diario emocional',
      desc: 'Pon en palabras lo que llevas dentro, sin juzgarte.',
      categoria: 'Autoconocimiento',
      duracion: 'A tu ritmo',
      imagen: 'assets/serenity-garden.svg',
      alt: 'Planta en crecimiento que acompaña un momento de reflexión'
    }
  ];

  constructor(public auth: AuthService, private animoService: AnimoService) {}

  ngOnInit(): void {
    this.animoService.obtenerAnimoHoy().subscribe({
      next: (animo) => this.animoSeleccionado.set(animo?.valor ?? null),
      error: (error: HttpErrorResponse) => this.errorAnimo.set(mensajeError(error, 'No pudimos cargar tu ánimo de hoy. Inténtalo de nuevo más tarde.'))
    });
  }

  registrarAnimo(valor: 1 | 2 | 3 | 4 | 5): void {
    this.animoSeleccionado.set(valor);
    this.mensajeAnimo.set('');
    this.errorAnimo.set('');
    this.animoService.registrarAnimo(valor).subscribe({
      next: () => this.mensajeAnimo.set('Tu registro de ánimo se guardó. Gracias por escucharte.'),
      error: (error: HttpErrorResponse) => this.errorAnimo.set(mensajeError(error, 'No pudimos guardar tu ánimo. Inténtalo de nuevo.'))
    });
  }
}


import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';
import { AnimoService } from '../../core/services/animo.service';
import { JardinInteractivoService } from '../../core/services/jardin-interactivo.service';
import {
  FraseMotivacional,
  FraseMotivacionalService
} from '../../core/services/frase-motivacional.service';

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

  // Frase motivacional inicial y mensaje de respaldo.
  readonly fraseDelDia = signal<FraseMotivacional>({
    frase: 'Pequeños pasos también cuentan.',
    autor: 'Serenity',
    religiosa: false
  });

  // Accesos a los ejercicios con sus respectivas imágenes PNG.
  readonly accesos = [
    {
      ruta: '/ejercicios/respiracion',
      titulo: 'Respiración consciente',
      desc: 'Recupera tu calma con una pausa guiada de respiración.',
      categoria: 'Calma y equilibrio',
      duracion: '5 min',
      imagen: 'assets/serenity-breathing.png',
      alt: 'Persona practicando respiración consciente en un paisaje natural'
    },
    {
      ruta: '/ejercicios/meditacion',
      titulo: 'Meditación guiada',
      desc: 'Vuelve al presente y encuentra un poco de paz en tu día.',
      categoria: 'Presencia plena',
      duracion: '5–15 min',
      imagen: 'assets/serenity-meditation.png',
      alt: 'Persona meditando tranquilamente en un ambiente acogedor'
    },
    {
      ruta: '/ejercicios/relajacion',
      titulo: 'Relajación muscular',
      desc: 'Suelta la tensión poco a poco, de la cabeza a los pies.',
      categoria: 'Descanso corporal',
      duracion: '10 min',
      imagen: 'assets/serenity-relaxation.png',
      alt: 'Ilustración de autocuidado y relajación'
    },
    {
      ruta: '/ejercicios/diario',
      titulo: 'Diario emocional',
      desc: 'Pon en palabras lo que sientes, sin juzgarte.',
      categoria: 'Autoconocimiento',
      duracion: 'A tu ritmo',
      imagen: 'assets/serenity-diary.png',
      alt: 'Diario personal para escribir y reflexionar sobre las emociones'
    }
  ];

  constructor(
      public auth: AuthService,
      private animoService: AnimoService,
      private jardinInteractivo: JardinInteractivoService,
      private fraseService: FraseMotivacionalService
  ) {}

  ngOnInit(): void {
    // Cargar la frase motivacional desde el backend.
    this.fraseService.obtenerFraseDelDia().subscribe({
      next: (frase) => {
        this.fraseDelDia.set(frase);
      },
      error: () => {
        // Mantener una frase de respaldo si falla la consulta.
        this.fraseDelDia.set({
          frase: 'Pequeños pasos también cuentan.',
          autor: 'Serenity',
          religiosa: false
        });
      }
    });

    // Consultar el estado de ánimo registrado para hoy.
    this.animoService.obtenerAnimoHoy().subscribe({
      next: (animo) => {
        this.animoSeleccionado.set(animo?.valor ?? null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorAnimo.set(
            mensajeError(
                error,
                'No pudimos cargar tu ánimo de hoy. Inténtalo de nuevo más tarde.'
            )
        );
      }
    });
  }

  registrarAnimo(valor: 1 | 2 | 3 | 4 | 5): void {
    this.animoSeleccionado.set(valor);
    this.mensajeAnimo.set('');
    this.errorAnimo.set('');

    this.animoService.registrarAnimo(valor).subscribe({
      next: () => {
        this.jardinInteractivo.registrarActividad('estado de ánimo');

        this.mensajeAnimo.set(
            'Tu registro de ánimo se guardó. Gracias por escucharte. +20 XP para tu jardín.'
        );
      },
      error: (error: HttpErrorResponse) => {
        this.errorAnimo.set(
            mensajeError(
                error,
                'No pudimos guardar tu ánimo. Inténtalo de nuevo.'
            )
        );
      }
    });
  }
}


import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnimoService } from '../../core/services/animo.service';

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
    { valor: 3, icono: '😐', etiqueta: 'Regular' },
    { valor: 4, icono: '🙂', etiqueta: 'Bien' },
    { valor: 5, icono: '😄', etiqueta: 'Muy bien' }
  ] as const;

  readonly animoSeleccionado = signal<1 | 2 | 3 | 4 | 5 | null>(null);
  readonly mensajeAnimo = signal('');
  readonly errorAnimo = signal('');

  readonly accesos = [
    { ruta: '/ejercicios/respiracion', titulo: 'Respiración', desc: 'Técnica guiada por fases.' },
    { ruta: '/ejercicios/meditacion', titulo: 'Meditación', desc: 'Sesión temporizada.' },
    { ruta: '/ejercicios/relajacion', titulo: 'Relajación muscular', desc: 'Tensión y relajación por grupos.' },
    { ruta: '/ejercicios/diario', titulo: 'Diario emocional', desc: 'Escribe libre o guiado.' }
  ];

  constructor(public auth: AuthService, private animoService: AnimoService) {}

  ngOnInit(): void {
    this.animoService.obtenerAnimoHoy().subscribe({
      next: (animo) => this.animoSeleccionado.set(animo?.valor ?? null),
      error: () => this.errorAnimo.set('No pudimos cargar tu ánimo de hoy. Inténtalo de nuevo más tarde.')
    });
  }

  registrarAnimo(valor: 1 | 2 | 3 | 4 | 5): void {
    this.animoSeleccionado.set(valor);
    this.mensajeAnimo.set('');
    this.errorAnimo.set('');
    this.animoService.registrarAnimo(valor).subscribe({
      next: () => this.mensajeAnimo.set('Ánimo guardado.'),
      error: () => this.errorAnimo.set('No pudimos guardar tu ánimo. Inténtalo de nuevo.')
    });
  }
}

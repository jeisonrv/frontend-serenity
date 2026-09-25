import { Component, signal } from '@angular/core';
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
export class DashboardComponent {
  readonly opcionesAnimo = [
    { valor: 1, icono: '😞', etiqueta: 'Muy mal' },
    { valor: 2, icono: '🙁', etiqueta: 'Mal' },
    { valor: 3, icono: '😐', etiqueta: 'Regular' },
    { valor: 4, icono: '🙂', etiqueta: 'Bien' },
    { valor: 5, icono: '😄', etiqueta: 'Muy bien' }
  ] as const;

  readonly animoRegistrado = signal(false);

  readonly accesos = [
    { ruta: '/ejercicios/respiracion', titulo: 'Respiración', desc: 'Técnica guiada por fases.' },
    { ruta: '/ejercicios/meditacion', titulo: 'Meditación', desc: 'Sesión temporizada.' },
    { ruta: '/ejercicios/relajacion', titulo: 'Relajación muscular', desc: 'Tensión y relajación por grupos.' },
    { ruta: '/ejercicios/diario', titulo: 'Diario emocional', desc: 'Escribe libre o guiado.' }
  ];

  constructor(public auth: AuthService, private animoService: AnimoService) {}

  registrarAnimo(valor: 1 | 2 | 3 | 4 | 5): void {
    this.animoService.registrarAnimo(valor).subscribe(() => this.animoRegistrado.set(true));
  }
}

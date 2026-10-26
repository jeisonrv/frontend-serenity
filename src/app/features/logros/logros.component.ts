import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamificacionService } from '../../core/services/gamificacion.service';
import { Logro } from '../../core/models/logro.model';

// RF11: desbloqueo de logros según el progreso del usuario
@Component({
  selector: 'app-logros',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './logros.component.html',
  styleUrl: './logros.component.scss'
})
export class LogrosComponent implements OnInit {
  readonly logros = signal<Logro[]>([]);
  readonly cargando = signal(true);
  readonly misiones = [
    { id: 'pausa', titulo: 'Regálate una pausa', detalle: 'Explora una práctica de respiración o meditación.', icono: '☁', ruta: '/ejercicios/respiracion' },
    { id: 'jardin', titulo: 'Visita tu jardín', detalle: 'Observa cómo evoluciona tu espacio personal.', icono: '🌱', ruta: '/jardin' },
    { id: 'presencia', titulo: 'Un momento de presencia', detalle: 'Prueba una meditación breve, solo si te apetece.', icono: '✦', ruta: '/ejercicios/meditacion' }
  ];

  constructor(private gamificacionService: GamificacionService) {}

  ngOnInit(): void {
    this.gamificacionService.listarLogros().subscribe({
      next: (datos) => {
        this.logros.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}

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

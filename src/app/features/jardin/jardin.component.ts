import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JardinService } from '../../core/services/jardin.service';
import { RegistroJardin } from '../../core/models/jardin.model';

// RF10: jardín virtual — representa el progreso mediante plantas que crecen con el uso
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

  constructor(private jardinService: JardinService) {}

  ngOnInit(): void {
    this.jardinService.obtenerJardin().subscribe({
      next: (datos) => {
        this.plantas.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  etapaCrecimiento(cantidadRegistros: number): 'semilla' | 'brote' | 'planta' | 'floracion' {
    if (cantidadRegistros < 3) return 'semilla';
    if (cantidadRegistros < 7) return 'brote';
    if (cantidadRegistros < 15) return 'planta';
    return 'floracion';
  }
}

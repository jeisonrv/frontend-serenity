import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly enlaces = [
    { ruta: '/inicio', etiqueta: 'Inicio', icono: '⌂' },
    { ruta: '/ejercicios/respiracion', etiqueta: 'Respiración', icono: '≈' },
    { ruta: '/ejercicios/meditacion', etiqueta: 'Meditación', icono: '○' },
    { ruta: '/ejercicios/relajacion', etiqueta: 'Relajación', icono: '↝' },
    { ruta: '/ejercicios/diario', etiqueta: 'Diario', icono: '✎' },
    { ruta: '/jardin', etiqueta: 'Jardín', icono: '⚘' },
    { ruta: '/logros', etiqueta: 'Logros', icono: '⬡' },
    { ruta: '/estadisticas', etiqueta: 'Estadísticas', icono: '▤' },
    { ruta: '/chat', etiqueta: 'Hablar con alguien', icono: '◐' }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}

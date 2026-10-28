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
  private readonly enlacesUsuario = [
    { ruta: '/inicio', etiqueta: 'Inicio', icono: '⌂' },
    { ruta: '/ejercicios/respiracion', etiqueta: 'Respiración', icono: '≈' },
    { ruta: '/ejercicios/meditacion', etiqueta: 'Meditación', icono: '○' },
    { ruta: '/ejercicios/relajacion', etiqueta: 'Relajación', icono: '↝' },
    { ruta: '/ejercicios/diario', etiqueta: 'Diario', icono: '✎' },
    { ruta: '/jardin', etiqueta: 'Jardín', icono: '⚘' },
    { ruta: '/logros', etiqueta: 'Logros', icono: '⬡' },
    { ruta: '/estadisticas', etiqueta: 'Estadísticas', icono: '▤' },
    { ruta: '/chat', etiqueta: 'Hablar con alguien', icono: '◐' },
    { ruta: '/ayuda', etiqueta: 'Líneas de ayuda', icono: '♡' },
    { ruta: '/terminos', etiqueta: 'Términos', icono: 'ⓘ' }
  ];

  private readonly enlacesOyente = [
    { ruta: '/oyente', etiqueta: 'Panel de oyente', icono: '☏' },
    { ruta: '/ayuda', etiqueta: 'Líneas de ayuda', icono: '♡' },
    { ruta: '/terminos', etiqueta: 'Términos', icono: 'ⓘ' }
  ];

  private readonly enlacesModerador = [
    { ruta: '/moderacion', etiqueta: 'Moderación', icono: '⚑' },
    { ruta: '/ayuda', etiqueta: 'Líneas de ayuda', icono: '♡' },
    { ruta: '/terminos', etiqueta: 'Términos', icono: 'ⓘ' }
  ];

  private readonly enlacesSinRol = [
    { ruta: '/ayuda', etiqueta: 'Líneas de ayuda', icono: '♡' },
    { ruta: '/terminos', etiqueta: 'Términos', icono: 'ⓘ' }
  ];

  private readonly enlaceCuenta = { ruta: '/cuenta', etiqueta: 'Mi cuenta', icono: '◉' };

  constructor(public auth: AuthService, private router: Router) {}

  get enlaces(): { ruta: string; etiqueta: string; icono: string }[] {
    let enlacesRol: { ruta: string; etiqueta: string; icono: string }[];
    switch (this.auth.usuario()?.rol) {
      case 'USUARIO': enlacesRol = this.enlacesUsuario; break;
      case 'OYENTE': enlacesRol = this.enlacesOyente; break;
      case 'MODERADOR': enlacesRol = this.enlacesModerador; break;
      default: return this.enlacesSinRol;
    }
    return [...enlacesRol, this.enlaceCuenta];
  }

  salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}

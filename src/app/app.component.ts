import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from './services/usuario.service';
import { Usuario } from './models/usuario';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private usuarioService = inject(UsuarioService);

  usuarios: Usuario[] = [];
  nuevo: Usuario = { nombre: '', email: '' };
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.usuarioService.listar().subscribe({
      next: data => this.usuarios = data,
      error: err => this.error = 'No se pudo conectar con el backend: ' + err.message
    });
  }

  guardar(): void {
    this.usuarioService.crear(this.nuevo).subscribe(() => {
      this.nuevo = { nombre: '', email: '' };
      this.cargar();
    });
  }

  eliminar(id: number): void {
    this.usuarioService.eliminar(id).subscribe(() => this.cargar());
  }
}

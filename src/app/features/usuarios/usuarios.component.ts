import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioGestion } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  usuarios: UsuarioGestion[] = [];
  nuevo: UsuarioGestion = { nombre: '', email: '' };
  error = '';

  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => { this.usuarios = data; this.error = ''; },
      error: (err) => { this.error = 'No se pudo conectar con el backend: ' + err.message; }
    });
  }
  guardar(): void {
    this.usuarioService.crear(this.nuevo).subscribe({
      next: () => { this.nuevo = { nombre: '', email: '' }; this.cargar(); },
      error: (err) => { this.error = 'No se pudo crear el usuario: ' + err.message; }
    });
  }
  eliminar(id: number): void {
    this.usuarioService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: (err) => { this.error = 'No se pudo eliminar el usuario: ' + err.message; }
    });
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { OyenteService } from '../../core/services/oyente.service';
import { CharlaActiva, CharlaDisponible, Oyente } from '../../core/models/oyente.model';
import { mensajeError } from '../../core/utils/mensaje-error';

@Component({
  selector: 'app-panel-oyente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-oyente.component.html',
  styleUrl: './panel-oyente.component.scss'
})
export class PanelOyenteComponent implements OnInit {
  readonly estado = signal<Oyente | null>(null);
  readonly cola = signal<CharlaDisponible[]>([]);
  readonly activas = signal<CharlaActiva[]>([]);
  readonly error = signal('');
  readonly confirmacion = signal('');
  readonly cargandoEstado = signal(true);
  readonly cargandoCola = signal(true);
  readonly cargandoActivas = signal(true);
  readonly guardandoDisponibilidad = signal(false);
  readonly aceptandoId = signal<number | null>(null);

  constructor(private oyenteService: OyenteService, private router: Router) {}

  ngOnInit(): void {
    this.actualizar();
  }

  actualizar(): void {
    this.cargarEstado();
    this.cargarCola();
    this.cargarActivas();
  }

  cambiarDisponibilidad(): void {
    const actual = this.estado();
    if (!actual || this.guardandoDisponibilidad()) return;
    const disponible = !actual.disponible;
    const pregunta = disponible
      ? '¿Activar tu disponibilidad para recibir conversaciones?'
      : '¿Desactivar tu disponibilidad para recibir conversaciones?';
    if (!window.confirm(pregunta)) return;
    this.error.set('');
    this.confirmacion.set('');
    this.guardandoDisponibilidad.set(true);
    this.oyenteService.cambiarDisponibilidad(disponible)
      .pipe(finalize(() => this.guardandoDisponibilidad.set(false)))
      .subscribe({
        next: () => {
          this.confirmacion.set(disponible
            ? 'Tu disponibilidad quedó activada.'
            : 'Tu disponibilidad quedó desactivada.');
          this.cargarEstado();
          this.cargarCola();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo actualizar tu disponibilidad.'))
      });
  }

  aceptar(charla: CharlaDisponible): void {
    if (this.aceptandoId() !== null) return;
    if (!window.confirm(`¿Aceptar la conversación #${charla.idConversacion}?`)) return;
    this.error.set('');
    this.confirmacion.set('');
    this.aceptandoId.set(charla.idConversacion);
    this.oyenteService.aceptar(charla.idConversacion)
      .pipe(finalize(() => this.aceptandoId.set(null)))
      .subscribe({
        next: () => {
          this.cargarCola();
          this.cargarActivas();
          void this.router.navigate(['/chat', charla.idConversacion], {
            state: { confirmacion: `Aceptaste la conversación #${charla.idConversacion}.` }
          });
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo aceptar esta conversación.'))
      });
  }

  private cargarEstado(): void {
    this.cargandoEstado.set(true);
    this.oyenteService.obtenerEstado()
      .pipe(finalize(() => this.cargandoEstado.set(false)))
      .subscribe({
        next: (estado) => this.estado.set(estado),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo cargar tu disponibilidad.'))
      });
  }

  private cargarCola(): void {
    this.cargandoCola.set(true);
    this.oyenteService.obtenerCola()
      .pipe(finalize(() => this.cargandoCola.set(false)))
      .subscribe({
        next: (cola) => this.cola.set(cola.charlas),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo cargar la cola de conversaciones.'))
      });
  }

  private cargarActivas(): void {
    this.cargandoActivas.set(true);
    this.oyenteService.obtenerActivas()
      .pipe(finalize(() => this.cargandoActivas.set(false)))
      .subscribe({
        next: (activas) => this.activas.set(activas),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudieron cargar tus conversaciones asignadas.'))
      });
  }
}

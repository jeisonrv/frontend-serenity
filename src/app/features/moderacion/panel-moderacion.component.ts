import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  DetalleReporte,
  EstadoReporte,
  ReporteChat,
  UsuarioRestringido
} from '../../core/models/moderacion.model';
import { ModeracionService } from '../../core/services/moderacion.service';
import { mensajeError } from '../../core/utils/mensaje-error';

@Component({
  selector: 'app-panel-moderacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-moderacion.component.html',
  styleUrl: './panel-moderacion.component.scss'
})
export class PanelModeracionComponent implements OnInit {
  readonly estados: EstadoReporte[] = ['PENDIENTE', 'PROCEDENTE', 'IMPROCEDENTE'];
  readonly filtro = signal<EstadoReporte | ''>('PENDIENTE');
  readonly reportes = signal<ReporteChat[]>([]);
  readonly detalle = signal<DetalleReporte | null>(null);
  readonly restringidos = signal<UsuarioRestringido[]>([]);
  readonly error = signal('');
  readonly confirmacion = signal('');
  readonly cargandoReportes = signal(true);
  readonly cargandoDetalle = signal(false);
  readonly cargandoRestringidos = signal(true);
  readonly resolviendoId = signal<number | null>(null);
  readonly usuarioRestriccionId = signal<number | null>(null);
  readonly restringiendo = signal(false);
  readonly levantandoId = signal<number | null>(null);

  decisionProcedente = true;
  observacion = '';
  motivoRestriccion = '';
  hasta = '';

  constructor(private moderacionService: ModeracionService) {}

  ngOnInit(): void {
    this.cargarReportes();
    this.cargarRestringidos();
  }

  cambiarFiltro(estado: EstadoReporte | ''): void {
    this.filtro.set(estado);
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.cargandoReportes.set(true);
    this.moderacionService.listarReportes(this.filtro() || undefined)
      .pipe(finalize(() => this.cargandoReportes.set(false)))
      .subscribe({
        next: (reportes) => this.reportes.set(reportes),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudieron cargar los reportes.'))
      });
  }

  verDetalle(reporte: ReporteChat): void {
    this.error.set('');
    this.detalle.set(null);
    this.cargandoDetalle.set(true);
    this.moderacionService.obtenerDetalle(reporte.id)
      .pipe(finalize(() => this.cargandoDetalle.set(false)))
      .subscribe({
        next: (detalle) => {
          this.detalle.set(detalle);
          this.observacion = detalle.reporte.observacionModerador ?? '';
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo cargar el detalle del reporte.'))
      });
  }

  resolver(): void {
    const detalle = this.detalle();
    const observacion = this.observacion.trim();
    if (!detalle || !observacion || observacion.length > 1000) {
      this.error.set('Escribe una observación de hasta 1000 caracteres para resolver el reporte.');
      return;
    }
    this.error.set('');
    this.confirmacion.set('');
    this.resolviendoId.set(detalle.reporte.id);
    this.moderacionService.resolverReporte(detalle.reporte.id, {
      procedente: this.decisionProcedente,
      observacion
    }).pipe(finalize(() => this.resolviendoId.set(null)))
      .subscribe({
        next: () => {
          this.confirmacion.set('El reporte quedó resuelto.');
          this.verDetalle(detalle.reporte);
          this.cargarReportes();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo resolver el reporte.'))
      });
  }

  prepararRestriccion(idUsuario: number): void {
    this.usuarioRestriccionId.set(idUsuario);
    this.motivoRestriccion = '';
    this.hasta = '';
    this.error.set('');
  }

  cancelarRestriccion(): void {
    this.usuarioRestriccionId.set(null);
    this.motivoRestriccion = '';
    this.hasta = '';
  }

  restringir(): void {
    const id = this.usuarioRestriccionId();
    const motivo = this.motivoRestriccion.trim();
    const hasta = this.hasta.trim();
    if (id === null || !motivo || motivo.length > 1000) {
      this.error.set('El motivo es obligatorio y debe tener hasta 1000 caracteres.');
      return;
    }
    if (hasta && (!Number.isFinite(Date.parse(hasta)) || new Date(hasta).getTime() <= Date.now())) {
      this.error.set('La fecha de finalización debe ser futura. Déjala vacía para una restricción indefinida.');
      return;
    }

    const vigencia = hasta ? ` hasta ${hasta.replace('T', ' ')}` : ' de forma indefinida';
    if (!window.confirm(`¿Aplicar una restricción${vigencia} al usuario #${id}?`)) return;

    const request = { motivo, ...(hasta ? { hasta: hasta.length === 16 ? `${hasta}:00` : hasta } : {}) };
    this.error.set('');
    this.confirmacion.set('');
    this.restringiendo.set(true);
    this.moderacionService.restringirUsuario(id, request)
      .pipe(finalize(() => this.restringiendo.set(false)))
      .subscribe({
        next: () => {
          this.cancelarRestriccion();
          this.confirmacion.set('La restricción se aplicó correctamente.');
          this.cargarRestringidos();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo restringir al usuario.'))
      });
  }

  levantarRestriccion(usuario: UsuarioRestringido): void {
    if (!window.confirm(`¿Levantar la restricción de ${usuario.username} (#${usuario.id})?`)) return;
    this.error.set('');
    this.confirmacion.set('');
    this.levantandoId.set(usuario.id);
    this.moderacionService.levantarRestriccion(usuario.id)
      .pipe(finalize(() => this.levantandoId.set(null)))
      .subscribe({
        next: () => {
          this.confirmacion.set(`Se levantó la restricción de ${usuario.username}.`);
          this.cargarRestringidos();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo levantar la restricción.'))
      });
  }

  cargarRestringidos(): void {
    this.cargandoRestringidos.set(true);
    this.moderacionService.listarRestringidos()
      .pipe(finalize(() => this.cargandoRestringidos.set(false)))
      .subscribe({
        next: (usuarios) => this.restringidos.set(usuarios),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudieron cargar los usuarios restringidos.'))
      });
  }
}

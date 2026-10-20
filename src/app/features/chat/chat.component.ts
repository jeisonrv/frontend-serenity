import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { ChatRealtimeService } from '../../core/services/chat-realtime.service';
import { MensajeChat } from '../../core/models/conversacion.model';
import { AuthService } from '../../core/services/auth.service';
import { mensajeError } from '../../core/utils/mensaje-error';

// RF12: solicitud de chat de apoyo · RF13: mensajería en tiempo real (anónima)
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly estado = signal<'inicial' | 'buscando' | 'cargando' | 'activo' | 'finalizado' | 'error'>('inicial');
  readonly conversacion = signal<{ idConversacion: number } | null>(null);
  readonly borrador = signal('');
  readonly mostrarReporte = signal(false);
  readonly motivoReporte = signal('');
  readonly error = signal<string | null>(null);
  readonly confirmacion = signal<string | null>(null);
  readonly procesando = signal(false);
  readonly esOyente = signal(false);
  readonly idAsignado = signal<number | null>(null);

  constructor(
    public chatService: ChatService,
    public chatRealtime: ChatRealtimeService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const confirmacion = this.router.getCurrentNavigation()?.extras.state?.['confirmacion'];
    if (typeof confirmacion === 'string') this.confirmacion.set(confirmacion);

    const id = this.route.snapshot.paramMap.get('id');
    if (id === null) return;

    const idConversacion = Number(id);
    this.esOyente.set(this.auth.usuario()?.rol === 'OYENTE');
    if (!Number.isSafeInteger(idConversacion) || idConversacion <= 0) {
      this.mostrarError('El identificador de la conversación no es válido.');
      return;
    }

    this.idAsignado.set(idConversacion);
    this.cargarConversacionAsignada(idConversacion);
  }

  cargarConversacionAsignada(idConversacion = this.idAsignado()): void {
    if (!idConversacion) return;

    this.error.set(null);
    this.estado.set('cargando');
    this.chatService.listarMensajes(idConversacion).subscribe({
      next: (mensajes) => {
        this.conversacion.set({ idConversacion });
        this.chatRealtime.conectar(idConversacion, mensajes);
        this.estado.set('activo');
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarError(mensajeError(err, 'No se pudo cargar el historial de la conversación.'));
      }
    });
  }

  solicitarChat(): void {
    this.error.set(null);
    this.estado.set('buscando');
    this.chatService.solicitarConversacion().subscribe({
      next: (conv) => {
        this.conversacion.set({ idConversacion: conv.idConversacion });
        this.chatRealtime.conectar(conv.idConversacion);
        this.estado.set('activo');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err, 'No se pudo solicitar una conversación.'));
        this.estado.set('inicial');
      }
    });
  }

  enviar(): void {
    const conv = this.conversacion();
    const texto = this.borrador().trim();
    if (!conv || !texto || !this.chatRealtime.conectado()) return;

    this.chatRealtime.enviarMensaje(conv.idConversacion, texto);
    this.borrador.set('');
  }

  finalizarConversacion(): void {
    const conv = this.conversacion();
    if (!conv || this.procesando()) return;
    this.error.set(null);
    this.procesando.set(true);
    this.chatService.finalizar(conv.idConversacion).subscribe({
      next: () => {
        this.chatRealtime.desconectar();
        this.estado.set('finalizado');
        this.procesando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err, 'No se pudo finalizar la conversación.'));
        this.procesando.set(false);
      }
    });
  }

  enviarReporte(): void {
    const conv = this.conversacion();
    const motivo = this.motivoReporte().trim();
    if (!conv || !motivo || this.procesando()) return;
    this.error.set(null);
    this.procesando.set(true);
    this.chatService
      .reportar({ idConversacion: conv.idConversacion, motivo })
      .subscribe({
        next: () => {
          this.mostrarReporte.set(false);
          this.motivoReporte.set('');
          this.procesando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err, 'No se pudo enviar el reporte.'));
          this.procesando.set(false);
        }
      });
  }

  private mostrarError(mensaje: string): void {
    this.error.set(mensaje);
    this.estado.set('error');
  }

  ngOnDestroy(): void {
    this.chatRealtime.desconectar();
  }
}

import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { ChatRealtimeService } from '../../core/services/chat-realtime.service';
import { Conversacion } from '../../core/models/conversacion.model';

// RF12: solicitud de chat de apoyo · RF13: mensajería en tiempo real (anónima)
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnDestroy {
  readonly estado = signal<'inicial' | 'buscando' | 'activo' | 'finalizado'>('inicial');
  readonly conversacion = signal<Conversacion | null>(null);
  readonly borrador = signal('');
  readonly mostrarReporte = signal(false);
  readonly motivoReporte = signal('');

  constructor(
    public chatService: ChatService,
    public chatRealtime: ChatRealtimeService
  ) {}

  solicitarChat(): void {
    this.estado.set('buscando');
    this.chatService.solicitarConversacion().subscribe({
      next: (conv) => {
        this.conversacion.set(conv);
        this.chatRealtime.conectar(conv.idConversacion);
        this.estado.set('activo');
      },
      error: () => this.estado.set('inicial')
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
    if (!conv) return;
    this.chatService.finalizar(conv.idConversacion).subscribe(() => {
      this.chatRealtime.desconectar();
      this.estado.set('finalizado');
    });
  }

  enviarReporte(): void {
    const conv = this.conversacion();
    if (!conv || !this.motivoReporte().trim()) return;
    this.chatService
      .reportar({ idConversacion: conv.idConversacion, motivo: this.motivoReporte() })
      .subscribe(() => {
        this.mostrarReporte.set(false);
        this.motivoReporte.set('');
      });
  }

  ngOnDestroy(): void {
    this.chatRealtime.desconectar();
  }
}

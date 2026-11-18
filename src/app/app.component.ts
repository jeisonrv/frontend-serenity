import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { ConsentService } from './core/services/consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly aceptarTerminos = signal(false);
  readonly aceptarSensibles = signal(false);
  readonly autorizacionSensiblesInicial = signal(false);
  readonly guardandoConsentimiento = signal(false);
  readonly errorConsentimiento = signal('');
  constructor(public auth: AuthService, public theme: ThemeService, public consent: ConsentService) {
    effect(() => {
      if (!this.consent.revisionPendiente()) return;
      const status = this.consent.status();
      this.autorizacionSensiblesInicial.set(status?.sensitiveDataConsentActive ?? false);
      this.aceptarSensibles.set(status?.sensitiveDataConsentActive ?? false);
    });
  }

  guardarRevisionConsentimientos(): void {
    if (!this.aceptarTerminos()) { this.errorConsentimiento.set('Debes aceptar los términos vigentes para continuar.'); return; }
    this.guardandoConsentimiento.set(true);
    this.consent.aceptarTerminos().subscribe({ next: () => {
      const fin = () => { this.guardandoConsentimiento.set(false); this.consent.revisionPendiente.set(false); this.revisarEstadoActual(); };
      const accionSensibles = this.aceptarSensibles()
        ? (this.autorizacionSensiblesInicial() ? null : this.consent.autorizarDatosSensibles())
        : (this.autorizacionSensiblesInicial() ? this.consent.revocarDatosSensibles() : null);
      if (accionSensibles) accionSensibles.subscribe({ next: fin, error: () => { this.guardandoConsentimiento.set(false); this.errorConsentimiento.set('No se pudo guardar la autorización opcional.'); } }); else fin();
    }, error: () => { this.guardandoConsentimiento.set(false); this.errorConsentimiento.set('No se pudieron guardar los términos. Inténtalo de nuevo.'); } });
  }

  private revisarEstadoActual(): void { this.consent.consultar().subscribe({ error: () => undefined }); }

  controlarFocoDialogo(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const dialog = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.dialog-consentimiento');
    const focusables = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}

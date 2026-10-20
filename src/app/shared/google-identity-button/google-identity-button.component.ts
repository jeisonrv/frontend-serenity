import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { GoogleButtonText, GoogleIdentityService } from '../../core/services/google-identity.service';

@Component({
  selector: 'app-google-identity-button',
  standalone: true,
  template: `
    <button class="google-placeholder" type="button" [hidden]="botonListo" disabled aria-disabled="true">
      <span class="google-mark" aria-hidden="true">G</span>
      <span>Continuar con Google</span>
    </button>
    <div #buttonContainer class="google-button-container" [hidden]="!botonListo"></div>
  `,
  styles: [`
    :host { display: flex; justify-content: center; min-height: 44px; margin-top: .65rem; }
    :host(.deshabilitado) { opacity: .55; pointer-events: none; }
    .google-button-container { min-height: 44px; }
    .google-placeholder {
      display: inline-flex; align-items: center; justify-content: center; gap: .75rem;
      width: min(100%, 320px); min-height: 44px; padding: .55rem 1rem;
      border: 1px solid #dadce0; border-radius: 6px; background: #fff;
      color: #3c4043; font: 500 14px Arial, sans-serif;
    }
    .google-placeholder:disabled { cursor: wait; opacity: .82; }
    .google-mark { font: 700 19px Arial, sans-serif; color: #4285f4; }
  `]
})
export class GoogleIdentityButtonComponent implements AfterViewInit, OnDestroy {
  @Input() text: GoogleButtonText = 'continue_with';
  @Input() disabled = false;
  @Output() credential = new EventEmitter<string>();
  @Output() loadError = new EventEmitter<string>();
  @ViewChild('buttonContainer', { static: true }) private buttonContainer!: ElementRef<HTMLDivElement>;

  @HostBinding('class.deshabilitado') get bloqueado(): boolean { return this.disabled; }

  private limpiarCallback?: () => void;
  private destruido = false;
  botonListo = false;

  constructor(private googleIdentity: GoogleIdentityService) {}

  ngAfterViewInit(): void {
    void this.googleIdentity.renderButton(
      this.buttonContainer.nativeElement,
      this.text,
      (credential) => this.credential.emit(credential)
    ).then((limpiar) => {
      if (this.destruido) limpiar();
      else {
        this.limpiarCallback = limpiar;
        this.botonListo = true;
      }
    }).catch((error: unknown) => {
      if (!this.destruido) {
        this.loadError.emit(error instanceof Error ? error.message : 'No se pudo cargar el botón de Google.');
      }
    });
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.limpiarCallback?.();
  }
}

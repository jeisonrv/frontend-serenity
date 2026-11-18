import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConsentService } from '../../core/services/consent.service';
import { POLITICA_DATOS } from './politica-datos.content';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.scss'
})
export class TerminosComponent implements OnInit {
  readonly politica = POLITICA_DATOS;
  readonly version = signal('Preliminar');
  readonly versionPolitica = signal('Preliminar');
  readonly fechaActualizacion = signal('7 de noviembre de 2026');
  constructor(private readonly consent: ConsentService) {}
  ngOnInit(): void {
    this.consent.versiones().subscribe({ next: data => {
      this.version.set(data.termsVersion ?? (data as any).versionTerminos ?? this.version());
      this.versionPolitica.set(data.privacyVersion ?? (data as any).versionPolitica ?? this.versionPolitica());
      const date = data.lastUpdated ?? (data as any).fechaActualizacion;
      if (date) this.fechaActualizacion.set(date);
    }, error: () => undefined });
  }
}

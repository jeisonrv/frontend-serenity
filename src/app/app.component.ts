import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  template: `
    <ng-container *ngIf="auth.autenticado(); else soloContenido">
      <app-navbar></app-navbar>
      <main class="contenido">
        <router-outlet></router-outlet>
      </main>
    </ng-container>
    <ng-template #soloContenido>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .contenido {
      margin-left: 220px;
      padding: 2rem 2.5rem;
      min-height: 100vh;
    }
    @media (max-width: 760px) {
      .contenido { margin-left: 0; padding: 1.25rem; padding-bottom: 4.5rem; }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}

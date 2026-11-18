import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConsentStatus, ConsentVersions } from '../models/consent.model';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly base = `${environment.apiUrl}/consents`;
  readonly status = signal<ConsentStatus | null>(null);
  readonly sensitiveRequired = signal(false);
  readonly revisionPendiente = signal(false);

  constructor(private readonly http: HttpClient) {}

  consultar(): Observable<ConsentStatus> {
    return this.http.get<ConsentStatus>(`${this.base}/me`).pipe(map(value => this.actualizarStatus(value)));
  }

  aceptarTerminos(): Observable<ConsentStatus> {
    return this.http.post<ConsentStatus>(`${this.base}/terms`, {}).pipe(map(value => this.actualizarStatus(value)));
  }

  autorizarDatosSensibles(): Observable<ConsentStatus> {
    return this.http.post<ConsentStatus>(`${this.base}/sensitive`, {}).pipe(map(value => this.actualizarStatus(value)));
  }

  revocarDatosSensibles(): Observable<ConsentStatus> {
    return this.http.delete<ConsentStatus>(`${this.base}/sensitive`).pipe(map(value => this.actualizarStatus(value)));
  }

  versiones(): Observable<ConsentVersions> { return this.http.get<ConsentVersions>(`${this.base}/versions`); }

  marcarAutorizacionRequerida(): void { this.sensitiveRequired.set(true); }
  limpiarAutorizacionRequerida(): void { this.sensitiveRequired.set(false); }

  private normalizar(raw: ConsentStatus): ConsentStatus {
    const value = raw as any;
    return {
      ...value,
      termsAccepted: value.termsAccepted ?? value.termsAcceptedCurrentVersion ?? value.terminosAceptados ?? false,
      termsVersion: value.termsVersion ?? value.versionTerminos ?? null,
      termsAcceptedAt: value.termsAcceptedAt ?? value.termsAcceptedDate ?? value.fechaAceptacionTerminos ?? null,
      currentTermsVersion: value.currentTermsVersion ?? value.latestTermsVersion ?? value.versionVigente ?? null,
      sensitiveDataConsentActive: value.sensitiveDataAuthorized ?? value.sensitiveDataConsentActive ?? value.sensitiveConsentActive ?? value.autorizacionDatosSensiblesActiva ?? false
    };
  }

  private actualizarStatus(value: ConsentStatus): ConsentStatus {
    const normalized = this.normalizar(value);
    this.status.set(normalized);
    return normalized;
  }
}

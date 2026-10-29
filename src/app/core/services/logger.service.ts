import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(...args: unknown[]): void {
    console.error(...args);
  }

  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  info(...args: unknown[]): void {
    if (!environment.production) console.info(...args);
  }

  debug(...args: unknown[]): void {
    if (!environment.production) console.debug(...args);
  }
}

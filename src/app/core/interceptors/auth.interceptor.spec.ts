import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConsentService } from '../services/consent.service';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'logout']);
    auth.getToken.and.returnValue('expired-token');
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const consent = jasmine.createSpyObj<ConsentService>(
      'ConsentService',
      ['marcarAutorizacionRequerida']
    );

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ConsentService, useValue: consent }
      ]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('does not send a bearer token or log out after a Google login 401', () => {
    const url = 'https://backend.example/api/auth/google';
    TestBed.inject(HttpClient).post(url, { credential: 'google-credential' })
      .subscribe({ error: () => undefined });

    const request = http.expectOne(url);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(
      { detail: 'Credencial de Google no válida.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps the bearer token and session when the profile request returns 401', () => {
    const url = 'https://backend.example/api/usuarios/me';
    TestBed.inject(HttpClient).get(url).subscribe({ error: () => undefined });

    const request = http.expectOne(url);
    expect(request.request.headers.get('Authorization')).toBe('Bearer expired-token');
    request.flush(
      { detail: 'Sesión inválida.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('sends the Serenity bearer token with the Google link request', () => {
    const url = 'https://backend.example/api/auth/vincular';
    TestBed.inject(HttpClient).post(url, { credential: 'google-id-token' })
      .subscribe();

    const request = http.expectOne(url);
    expect(request.request.headers.get('Authorization')).toBe('Bearer expired-token');
    expect(request.request.body).toEqual({ credential: 'google-id-token' });
    request.flush(null);
  });
});

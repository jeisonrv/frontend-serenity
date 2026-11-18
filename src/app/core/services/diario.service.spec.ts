import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { DiarioService } from './diario.service';

describe('DiarioService', () => {
  let service: DiarioService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DiarioService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('guarda una entrada', () => {
    const requestBody = { contenido: 'Hoy me siento mejor', tipoPrompt: 'libre' };
    const response = { idEntrada: 1, idUsuario: 2, ...requestBody };
    service.guardarEntrada(requestBody).subscribe(value => expect(value).toEqual(response));
    const request = http.expectOne(`${environment.apiUrl}/diario`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush(response);
  });
  it('normaliza la página de historial y reporta HTTP error', () => {
    service.listarEntradas().subscribe(value => expect(value).toEqual([]));
    http.expectOne(`${environment.apiUrl}/diario`).flush({ content: [] });
    service.listarEntradas().subscribe({ error: error => expect(error.status).toBe(500) });
    http.expectOne(`${environment.apiUrl}/diario`).flush('', { status: 500, statusText: 'Server Error' });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AnimoService } from './animo.service';

describe('AnimoService', () => {
  let service: AnimoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AnimoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('registra el estado de ánimo', () => {
    const data = { idAnimo: 1, idUsuario: 2, valor: 4 as const, fechaRegistro: '2026-01-01' };
    service.registrarAnimo(4).subscribe(value => expect(value).toEqual(data));
    const request = http.expectOne(`${environment.apiUrl}/animo`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ valor: 4 });
    request.flush(data);
  });
  it('interpreta un estado de ánimo ausente como null', () => {
    service.obtenerAnimoHoy().subscribe(value => expect(value).toBeNull());
    http.expectOne(`${environment.apiUrl}/animo/hoy`).flush(null, { status: 204, statusText: 'No Content' });
  });
  it('propaga error al cargar el historial', () => {
    service.historialAnimo().subscribe({ error: error => expect(error.status).toBe(500) });
    http.expectOne(`${environment.apiUrl}/animo`).flush('', { status: 500, statusText: 'Server Error' });
  });
});

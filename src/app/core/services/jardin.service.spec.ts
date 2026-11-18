import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { JardinService } from './jardin.service';

describe('JardinService', () => {
  let service: JardinService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(JardinService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('obtiene las plantas guardadas', () => {
    const data = [{ idJardin: 1, idUsuario: 2, tipoPlanta: 'Lavanda', fechaRegistro: '2026-01-01' }];
    service.obtenerJardin().subscribe(value => expect(value).toEqual(data));
    http.expectOne(`${environment.apiUrl}/jardin`).flush(data);
  });
  it('propaga errores HTTP', () => {
    service.obtenerJardin().subscribe({ error: error => expect(error.status).toBe(503) });
    http.expectOne(`${environment.apiUrl}/jardin`).flush('', { status: 503, statusText: 'Unavailable' });
  });
});

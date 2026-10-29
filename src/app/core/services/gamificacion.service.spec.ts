import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { GamificacionService } from './gamificacion.service';

describe('GamificacionService', () => {
  let service: GamificacionService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GamificacionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lista logros', () => {
    const data = [{ id: 1, nombre: 'Inicio', descripcion: 'Primero', desbloqueado: true }];
    service.listarLogros().subscribe(value => expect(value).toEqual(data));
    http.expectOne(`${environment.apiUrl}/logros`).flush(data);
  });
  it('propaga errores al listar logros', () => {
    service.listarLogros().subscribe({ error: error => expect(error.status).toBe(500) });
    http.expectOne(`${environment.apiUrl}/logros`).flush('fallo', { status: 500, statusText: 'Server Error' });
  });
  it('obtiene resumen de estadísticas', () => {
    const data = { totalSesiones: 3, minutosTotales: 20, racha: 2 };
    service.resumenEstadisticas().subscribe(value => expect(value).toEqual(data));
    http.expectOne(`${environment.apiUrl}/estadisticas/resumen`).flush(data);
  });
});

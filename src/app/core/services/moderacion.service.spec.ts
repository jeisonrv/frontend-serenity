import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ModeracionService } from './moderacion.service';

describe('ModeracionService', () => {
  let service: ModeracionService;
  let http: HttpTestingController;
  const base = environment.apiUrl + '/moderacion';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ModeracionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista reportes sin filtro', () => {
    service.listarReportes().subscribe();
    const request = http.expectOne(base + '/reportes');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('filtra reportes por estado', () => {
    service.listarReportes('PENDIENTE').subscribe();
    const request = http.expectOne(req => req.url === base + '/reportes');
    expect(request.request.params.get('estado')).toBe('PENDIENTE');
    request.flush([]);
  });

  it('obtiene el detalle de un reporte', () => {
    service.obtenerDetalle(9).subscribe();
    const request = http.expectOne(base + '/reportes/9');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('envía la resolución de un reporte', () => {
    const body = { procedente: true, observacion: 'Revisado' };
    service.resolverReporte(9, body).subscribe();
    const request = http.expectOne(base + '/reportes/9/resolver');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('lista los usuarios restringidos', () => {
    service.listarRestringidos().subscribe();
    const request = http.expectOne(base + '/usuarios/restringidos');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('crea una restricción para un usuario', () => {
    const body = { motivo: 'Revisión de conducta' };
    service.restringirUsuario(15, body).subscribe();
    const request = http.expectOne(base + '/usuarios/15/restriccion');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('levanta la restricción de un usuario', () => {
    service.levantarRestriccion(15).subscribe();
    const request = http.expectOne(base + '/usuarios/15/restriccion');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });
});

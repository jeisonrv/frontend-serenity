import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecordatoriosService } from './recordatorios.service';

describe('RecordatoriosService', () => {
  let service: RecordatoriosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(RecordatoriosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta la preferencia actual de recordatorios', () => {
    let resultado: unknown;
    service.consultar().subscribe(value => resultado = value);
    const request = http.expectOne('/api/usuarios/me/recordatorios');
    expect(request.request.method).toBe('GET');
    request.flush({ activo: true });
    expect(resultado).toEqual({ activo: true });
  });

  it('actualiza y devuelve la preferencia de recordatorios', () => {
    let resultado: unknown;
    service.actualizar(false).subscribe(value => resultado = value);
    const request = http.expectOne('/api/usuarios/me/recordatorios');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ activo: false });
    request.flush({ activo: false });
    expect(resultado).toEqual({ activo: false });
  });
});

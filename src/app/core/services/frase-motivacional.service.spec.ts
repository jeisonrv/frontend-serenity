import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { FraseMotivacionalService } from './frase-motivacional.service';

describe('FraseMotivacionalService', () => {
  let service: FraseMotivacionalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(FraseMotivacionalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta la frase motivacional del día al backend', () => {
    const respuesta = { frase: 'Respira con calma', autor: 'Serenity', religiosa: false };
    let recibida: unknown;
    service.obtenerFraseDelDia().subscribe(value => recibida = value);
    const request = http.expectOne(environment.apiUrl + '/frases/motivacional');
    expect(request.request.method).toBe('GET');
    request.flush(respuesta);
    expect(recibida).toEqual(respuesta);
  });
});

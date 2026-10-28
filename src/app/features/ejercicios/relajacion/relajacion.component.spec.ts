import { of } from 'rxjs';
import { EjerciciosService } from '../../../core/services/ejercicios.service';
import { JardinInteractivoService } from '../../../core/services/jardin-interactivo.service';
import { RelajacionComponent } from './relajacion.component';

describe('RelajacionComponent - integración con el jardín', () => {
  let component: RelajacionComponent;
  let ejercicios: jasmine.SpyObj<EjerciciosService>;
  let jardin: jasmine.SpyObj<JardinInteractivoService>;

  beforeEach(() => {
    ejercicios = jasmine.createSpyObj<EjerciciosService>('EjerciciosService', ['registrarSesion']);
    ejercicios.registrarSesion.and.returnValue(of({} as any));
    jardin = jasmine.createSpyObj<JardinInteractivoService>('JardinInteractivoService', ['registrarActividad']);
    component = new RelajacionComponent(ejercicios, jardin);
  });

  afterEach(() => component.ngOnDestroy());

  it('registra la sesión y recompensa al jardín cuando termina', () => {
    component.segundosTotales.set(42);
    (component as any).finalizar();
    expect(ejercicios.registrarSesion).toHaveBeenCalledWith({ tipoEjercicio: 'relajacion', duracion: 42 });
    expect(jardin.registrarActividad).toHaveBeenCalledWith('relajacion');
    expect(component.completado()).toBeTrue();
    expect(component.enCurso()).toBeFalse();
  });
});

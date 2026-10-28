import { of } from 'rxjs';
import { EjerciciosService } from '../../../core/services/ejercicios.service';
import { JardinInteractivoService } from '../../../core/services/jardin-interactivo.service';
import { RespiracionComponent } from './respiracion.component';

describe('RespiracionComponent - integración con el jardín', () => {
  let component: RespiracionComponent;
  let ejercicios: jasmine.SpyObj<EjerciciosService>;
  let jardin: jasmine.SpyObj<JardinInteractivoService>;

  beforeEach(() => {
    ejercicios = jasmine.createSpyObj<EjerciciosService>('EjerciciosService', ['registrarSesion']);
    ejercicios.registrarSesion.and.returnValue(of({} as any));
    jardin = jasmine.createSpyObj<JardinInteractivoService>('JardinInteractivoService', ['registrarActividad']);
    component = new RespiracionComponent(ejercicios, jardin);
  });

  afterEach(() => component.ngOnDestroy());

  it('registra la sesión y recompensa al jardín cuando termina', () => {
    component.segundosTotales.set(75);
    (component as any).finalizar();
    expect(ejercicios.registrarSesion).toHaveBeenCalledWith({ tipoEjercicio: 'respiracion', duracion: 75 });
    expect(jardin.registrarActividad).toHaveBeenCalledWith('respiracion');
    expect(component.completado()).toBeTrue();
    expect(component.enCurso()).toBeFalse();
  });
});

import { of } from 'rxjs';
import { EjerciciosService } from '../../../core/services/ejercicios.service';
import { JardinInteractivoService } from '../../../core/services/jardin-interactivo.service';
import { MeditacionComponent } from './meditacion.component';

describe('MeditacionComponent - integración con el jardín', () => {
  let component: MeditacionComponent;
  let ejercicios: jasmine.SpyObj<EjerciciosService>;
  let jardin: jasmine.SpyObj<JardinInteractivoService>;

  beforeEach(() => {
    ejercicios = jasmine.createSpyObj<EjerciciosService>('EjerciciosService', ['registrarSesion']);
    ejercicios.registrarSesion.and.returnValue(of({} as any));
    jardin = jasmine.createSpyObj<JardinInteractivoService>('JardinInteractivoService', ['registrarActividad']);
    component = new MeditacionComponent(ejercicios, jardin);
  });

  afterEach(() => component.ngOnDestroy());

  it('registra la sesión y recompensa al jardín cuando termina', () => {
    component.duracionMin.set(5);
    (component as any).finalizar();
    expect(ejercicios.registrarSesion).toHaveBeenCalledWith({ tipoEjercicio: 'meditacion', duracion: 300 });
    expect(jardin.registrarActividad).toHaveBeenCalledWith('meditacion');
    expect(component.completado()).toBeTrue();
    expect(component.enCurso()).toBeFalse();
  });
});

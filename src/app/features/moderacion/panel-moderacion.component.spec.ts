import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ModeracionService } from '../../core/services/moderacion.service';
import { PanelModeracionComponent } from './panel-moderacion.component';

describe('PanelModeracionComponent', () => {
  let component: PanelModeracionComponent;
  let api: jasmine.SpyObj<ModeracionService>;
  const detalle = { reporte: { id: 7, observacionModerador: 'Nota anterior' } } as any;

  beforeEach(() => {
    api = jasmine.createSpyObj<ModeracionService>('ModeracionService', [
      'listarReportes', 'obtenerDetalle', 'resolverReporte',
      'listarRestringidos', 'restringirUsuario', 'levantarRestriccion'
    ]);
    api.listarReportes.and.returnValue(of([]));
    api.obtenerDetalle.and.returnValue(of(detalle));
    api.resolverReporte.and.returnValue(of({} as any));
    api.listarRestringidos.and.returnValue(of([]));
    api.restringirUsuario.and.returnValue(of({} as any));
    api.levantarRestriccion.and.returnValue(of({} as any));
    component = new PanelModeracionComponent(api);
  });

  it('carga reportes y usuarios restringidos al iniciar', () => {
    component.ngOnInit();
    expect(api.listarReportes).toHaveBeenCalledWith('PENDIENTE');
    expect(api.listarRestringidos).toHaveBeenCalled();
    expect(component.cargandoReportes()).toBeFalse();
    expect(component.cargandoRestringidos()).toBeFalse();
  });

  it('actualiza el filtro y vuelve a cargar reportes', () => {
    component.cambiarFiltro('PROCEDENTE');
    expect(component.filtro()).toBe('PROCEDENTE');
    expect(api.listarReportes).toHaveBeenCalledWith('PROCEDENTE');
  });

  it('expone el mensaje de error cuando falla la carga de reportes', () => {
    api.listarReportes.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Error de reportes' } })
    ));
    component.cargarReportes();
    expect(component.error()).toBe('Error de reportes');
    expect(component.cargandoReportes()).toBeFalse();
  });

  it('carga el detalle y la observación del moderador', () => {
    component.verDetalle({ id: 7 } as any);
    expect(component.detalle()).toEqual(detalle);
    expect(component.observacion).toBe('Nota anterior');
    expect(component.cargandoDetalle()).toBeFalse();
  });

  it('expone un error cuando no puede cargar el detalle', () => {
    api.obtenerDetalle.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 500, error: { message: 'No disponible' }
    })));
    component.verDetalle({ id: 7 } as any);
    expect(component.error()).toBe('No disponible');
  });

  it('no resuelve un reporte si falta detalle u observación válida', () => {
    component.resolver();
    expect(component.error()).toContain('observación');
    expect(api.resolverReporte).not.toHaveBeenCalled();

    component.detalle.set(detalle);
    component.observacion = '   ';
    component.resolver();
    expect(component.error()).toContain('observación');
    expect(api.resolverReporte).not.toHaveBeenCalled();
  });

  it('resuelve el reporte y refresca detalle y lista', () => {
    component.detalle.set(detalle);
    component.observacion = '  Revisado correctamente  ';
    component.resolver();

    expect(api.resolverReporte).toHaveBeenCalledWith(7, {
      procedente: true, observacion: 'Revisado correctamente'
    });
    expect(component.confirmacion()).toBe('El reporte quedó resuelto.');
    expect(api.obtenerDetalle).toHaveBeenCalled();
    expect(api.listarReportes).toHaveBeenCalled();
    expect(component.resolviendoId()).toBeNull();
  });

  it('prepara y cancela una restricción', () => {
    component.prepararRestriccion(23);
    expect(component.usuarioRestriccionId()).toBe(23);
    component.motivoRestriccion = 'motivo';
    component.hasta = '2099-01-01T12:00';
    component.cancelarRestriccion();
    expect(component.usuarioRestriccionId()).toBeNull();
    expect(component.motivoRestriccion).toBe('');
    expect(component.hasta).toBe('');
  });

  it('valida los datos de la restricción antes de llamar al backend', () => {
    component.restringir();
    expect(component.error()).toContain('obligatorio');

    component.prepararRestriccion(23);
    component.motivoRestriccion = 'motivo';
    component.hasta = '2000-01-01T12:00';
    component.restringir();
    expect(component.error()).toContain('futura');
    expect(api.restringirUsuario).not.toHaveBeenCalled();
  });

  it('aplica una restricción indefinida tras confirmar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.prepararRestriccion(23);
    component.motivoRestriccion = 'Conducta inadecuada';
    component.restringir();

    expect(api.restringirUsuario).toHaveBeenCalledWith(23, {
      motivo: 'Conducta inadecuada'
    });
    expect(component.confirmacion()).toBe('La restricción se aplicó correctamente.');
    expect(component.restringiendo()).toBeFalse();
    expect(component.usuarioRestriccionId()).toBeNull();
  });

  it('no aplica una restricción si la confirmación es cancelada', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.prepararRestriccion(23);
    component.motivoRestriccion = 'Conducta inadecuada';
    component.restringir();
    expect(api.restringirUsuario).not.toHaveBeenCalled();
  });

  it('levanta una restricción después de la confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.levantarRestriccion({ id: 23, username: 'usuario' } as any);
    expect(api.levantarRestriccion).toHaveBeenCalledWith(23);
    expect(component.confirmacion()).toContain('usuario');
    expect(component.levantandoId()).toBeNull();
  });

  it('no levanta una restricción si se cancela la confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.levantarRestriccion({ id: 23, username: 'usuario' } as any);
    expect(api.levantarRestriccion).not.toHaveBeenCalled();
  });

  it('muestra errores al cargar usuarios restringidos', () => {
    api.listarRestringidos.and.returnValue(throwError(() =>
      new HttpErrorResponse({ status: 500, error: { message: 'Error de usuarios' } })
    ));
    component.cargarRestringidos();
    expect(component.error()).toBe('Error de usuarios');
    expect(component.cargandoRestringidos()).toBeFalse();
  });
});

import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RegistroJardin } from '../../core/models/jardin.model';
import { JardinService } from '../../core/services/jardin.service';
import { JardinInteractivoService } from '../../core/services/jardin-interactivo.service';
import { JardinComponent } from './jardin.component';

describe('JardinComponent', () => {
  let component: JardinComponent;
  let api: jasmine.SpyObj<JardinService>;
  let jardin: JardinInteractivoService;

  beforeEach(() => {
    localStorage.clear();
    const auth = {
      usuario: () => ({ id: 524, username: 'jardin-test' })
    } as unknown as AuthService;
    jardin = new JardinInteractivoService(auth);
    api = jasmine.createSpyObj<JardinService>('JardinService', ['obtenerJardin']);
    api.obtenerJardin.and.returnValue(of([]));
    component = new JardinComponent(api, jardin);
  });

  afterEach(() => {
    component.ngOnDestroy();
    localStorage.clear();
  });

  it('calcula los valores iniciales del jardín', () => {
    expect(component.totalPlantas()).toBe(0);
    expect(component.xp()).toBe(0);
    expect(component.nivel()).toBe(1);
    expect(component.progresoSiguiente()).toBe(0);
    expect(component.nombreSiguienteNivel()).toBe('Primeros brotes');
    expect(component.mensajeJardin()).toBe('Todo gran jardín empieza con una semilla.');
    expect(component.recompensas().every(r => !r.desbloqueada)).toBeTrue();
  });

  it('carga registros válidos y omite los elementos inválidos', () => {
    const registro: RegistroJardin = {
      idJardin: 1, idUsuario: 5, tipoPlanta: 'Girasol',
      fechaRegistro: new Date().toISOString()
    };
    api.obtenerJardin.and.returnValue(of([
      registro,
      null as unknown as RegistroJardin,
      { ...registro, idJardin: Number.NaN }
    ]));
    component.cargarJardin();

    expect(component.cargando()).toBeFalse();
    expect(component.error()).toBe('');
    expect(component.totalPlantas()).toBe(1);
  });

  it('conserva el jardín local si falla la sincronización remota', () => {
    api.obtenerJardin.and.returnValue(throwError(() => new Error('sin servidor')));
    component.cargarJardin();

    expect(component.cargando()).toBeFalse();
    expect(component.error()).toContain('Tu jardín de este dispositivo sigue disponible');
  });

  it('inicializa el servicio y carga el jardín', () => {
    component.ngOnInit();
    expect(api.obtenerJardin).toHaveBeenCalled();
    expect(component.cargando()).toBeFalse();
  });

  it('siembra una planta, la selecciona y restablece el filtro', () => {
    component.cambiarFiltro('flores');
    component.sembrarSemilla();

    expect(component.totalPlantas()).toBe(1);
    expect(component.plantaSeleccionada()).not.toBeNull();
    expect(component.filtro()).toBe('todas');
    expect(component.mensajeFeedback()).toContain('Has sembrado');
  });

  it('riega una planta seleccionada hasta la floración y gestiona el feedback', () => {
    component.sembrarSemilla();
    component.regarSeleccionada();
    expect(component.plantaSeleccionada()?.etapa).toBe('brote');
    component.regarSeleccionada();
    expect(component.plantaSeleccionada()?.etapa).toBe('planta');
    component.regarSeleccionada();
    expect(component.plantaSeleccionada()?.etapa).toBe('floracion');
    expect(component.xp()).toBe(15);
    expect(component.animacionRiego()).toBeTrue();
    expect(component.recompensas().find(r => r.id === 'primera-flor')?.desbloqueada).toBeTrue();
  });

  it('muestra un mensaje si se intenta regar una planta que ya floreció', () => {
    component.sembrarSemilla();
    component.regarSeleccionada();
    component.regarSeleccionada();
    component.regarSeleccionada();
    component.regarSeleccionada();
    expect(component.mensajeFeedback()).toContain('plena floración');
  });

  it('no hace nada al regar o cambiar el tipo sin una planta seleccionada', () => {
    component.regarSeleccionada();
    component.cambiarTipo('girasol');
    expect(component.totalPlantas()).toBe(0);
  });

  it('permite personalizar el tipo de la planta seleccionada', () => {
    component.sembrarSemilla();
    component.cambiarTipo('tulipan');
    expect(component.plantaSeleccionada()?.tipo).toBe('tulipan');
    expect(component.plantaSeleccionada()?.nombre).toBe('Tulipán de serenidad');
    expect(component.mensajeFeedback()).toContain('nuevo aspecto');
  });

  it('mantiene bloqueada una decoración hasta alcanzar la experiencia requerida', () => {
    component.cambiarDecoracion('mariposas');
    expect(component.mensajeFeedback()).toContain('40 XP');

    jardin.registrarActividad('respiracion');
    jardin.registrarActividad('meditacion');
    component.cambiarDecoracion('mariposas');
    expect(jardin.estado().decoracion).toBe('mariposas');
    expect(component.mensajeFeedback()).toContain('cambiado el ambiente');
  });

  it('alterna el ambiente y muestra un mensaje para cada modo', () => {
    component.alternarAmbiente();
    expect(jardin.estado().modoNoche).toBeTrue();
    expect(component.mensajeFeedback()).toContain('Modo noche activado');
    component.alternarAmbiente();
    expect(component.mensajeFeedback()).toContain('luz del día');
  });

  it('filtra las flores y los brotes', () => {
    const id = jardin.sembrarSemilla('lavanda');
    jardin.regarPlanta(id);
    jardin.regarPlanta(id);
    jardin.regarPlanta(id);
    component.cambiarFiltro('flores');
    expect(component.plantasVisibles().length).toBe(1);

    jardin.sembrarSemilla('girasol');
    component.cambiarFiltro('brotes');
    expect(component.plantasVisibles().length).toBe(1);
    component.cambiarFiltro('todas');
    expect(component.plantasVisibles().length).toBe(2);
  });

  it('calcula símbolos visuales para plantas en crecimiento y florecidas', () => {
    const lavanda = jardin.sembrarSemilla('lavanda');
    jardin.regarPlanta(lavanda);
    jardin.regarPlanta(lavanda);
    const girasol = jardin.sembrarSemilla('girasol');
    jardin.regarPlanta(girasol);
    jardin.regarPlanta(girasol);
    const tulipan = jardin.sembrarSemilla('tulipan');
    jardin.regarPlanta(tulipan);
    jardin.regarPlanta(tulipan);

    const visuales = component.plantasVisuales();
    expect(visuales.find(p => p.id === lavanda)?.simbolo).toBe('🪻');
    expect(visuales.find(p => p.id === girasol)?.simbolo).toBe('🌿');
    expect(visuales.find(p => p.id === tulipan)?.simbolo).toBe('🪴');
    expect(visuales.every(p => p.demora.startsWith('delay-'))).toBeTrue();
  });

  it('calcula los niveles y recompensas por experiencia y actividades', () => {
    for (let i = 0; i < 12; i++) jardin.registrarActividad('bienestar');
    expect(component.nivel()).toBe(4);
    expect(component.progresoSiguiente()).toBe(100);
    expect(component.nombreSiguienteNivel()).toBe('Nivel máximo alcanzado');
    expect(component.mensajeJardin()).toContain('muchos momentos');
    expect(component.recompensas().find(r => r.id === 'primera-pausa')?.desbloqueada).toBeTrue();
    expect(component.recompensas().find(r => r.id === 'tres-pausas')?.desbloqueada).toBeTrue();
    expect(component.recompensas().find(r => r.id === 'jardin-completo')?.desbloqueada).toBeTrue();
  });

  it('traduce cada etapa de la planta a una etiqueta legible', () => {
    expect(component.etiquetaEtapa('semilla')).toBe('Semilla');
    expect(component.etiquetaEtapa('brote')).toBe('Brote nuevo');
    expect(component.etiquetaEtapa('planta')).toBe('En crecimiento');
    expect(component.etiquetaEtapa('floracion')).toBe('En floración');
  });
});

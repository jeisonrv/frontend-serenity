import { AuthService } from './auth.service';
import { RegistroJardin } from '../models/jardin.model';
import { JardinInteractivoService } from './jardin-interactivo.service';

describe('JardinInteractivoService', () => {
  let service: JardinInteractivoService;

  function authFor(userId: number): AuthService {
    return {
      usuario: () => ({ id: userId, username: 'prueba-' + userId })
    } as unknown as AuthService;
  }

  beforeEach(() => {
    localStorage.clear();
    service = new JardinInteractivoService(authFor(101));
  });

  afterEach(() => localStorage.clear());

  it('inicia con estado vacío y decoracion natural', () => {
    expect(service.estado().xp).toBe(0);
    expect(service.estado().plantas).toEqual([]);
    expect(service.estado().decoracion).toBe('natural');
    expect(service.estado().modoNoche).toBeFalse();
  });

  it('registra actividades, otorga experiencia y alterna tipos de planta', () => {
    service.registrarActividad('respiracion');
    service.registrarActividad('meditacion');
    service.registrarActividad('relajacion');

    const estado = service.estado();
    expect(estado.xp).toBe(60);
    expect(estado.actividadesCompletadas).toBe(3);
    expect(estado.plantas.map(planta => planta.tipo)).toEqual([
      'tulipan', 'girasol', 'lavanda'
    ]);
    expect(estado.plantas[0].actividadOrigen).toBe('relajacion');
  });

  it('siembra una semilla con el tipo y nombre correctos', () => {
    const id = service.sembrarSemilla('girasol');
    const planta = service.estado().plantas[0];

    expect(planta.id).toBe(id);
    expect(planta.tipo).toBe('girasol');
    expect(planta.nombre).toBe('Girasol de esperanza');
    expect(planta.etapa).toBe('semilla');
    expect(planta.riegos).toBe(0);
  });

  it('avanza la planta por las tres etapas de riego y suma experiencia', () => {
    const id = service.sembrarSemilla();
    expect(service.regarPlanta(id)).toBe('brote');
    expect(service.regarPlanta(id)).toBe('planta');
    expect(service.regarPlanta(id)).toBe('floracion');
    expect(service.estado().xp).toBe(15);
    expect(service.estado().plantas[0].riegos).toBe(3);
    expect(service.regarPlanta(id)).toBeNull();
    expect(service.estado().xp).toBe(15);
  });

  it('ignora el riego de identificadores inexistentes', () => {
    expect(service.regarPlanta('inexistente')).toBeNull();
    expect(service.estado().xp).toBe(0);
  });

  it('permite cambiar el tipo y el nombre de una planta', () => {
    const id = service.sembrarSemilla();
    service.cambiarTipoPlanta(id, 'tulipan');
    expect(service.estado().plantas[0].tipo).toBe('tulipan');
    expect(service.estado().plantas[0].nombre).toBe('Tulipán de serenidad');
  });

  it('bloquea decoraciones por experiencia y desbloquea los umbrales', () => {
    expect(service.decoracionDesbloqueada('natural')).toBeTrue();
    expect(service.seleccionarDecoracion('mariposas')).toBeFalse();

    for (let i = 0; i < 7; i++) service.registrarActividad('bienestar');

    expect(service.decoracionDesbloqueada('mariposas')).toBeTrue();
    expect(service.decoracionDesbloqueada('faroles')).toBeTrue();
    expect(service.decoracionDesbloqueada('fuente')).toBeTrue();
    expect(service.seleccionarDecoracion('fuente')).toBeTrue();
    expect(service.estado().decoracion).toBe('fuente');
  });

  it('alterna el ambiente de día y noche', () => {
    service.alternarAmbiente();
    expect(service.estado().modoNoche).toBeTrue();
    service.alternarAmbiente();
    expect(service.estado().modoNoche).toBeFalse();
  });

  it('persiste el estado para el usuario y lo recupera en otra instancia', () => {
    service.registrarActividad('meditacion');
    service.alternarAmbiente();

    const recuperado = new JardinInteractivoService(authFor(101));
    expect(recuperado.estado().xp).toBe(20);
    expect(recuperado.estado().plantas.length).toBe(1);
    expect(recuperado.estado().modoNoche).toBeTrue();
  });

  it('usa una clave de almacenamiento diferente para cada usuario', () => {
    service.sembrarSemilla();
    const otroUsuario = new JardinInteractivoService(authFor(202));
    expect(otroUsuario.estado().plantas).toEqual([]);
    expect(service.estado().plantas.length).toBe(1);
  });

  it('recupera el estado inicial si el almacenamiento contiene JSON inválido', () => {
    localStorage.setItem('serenity_jardin_interactivo_v1_101', '{mal json');
    const recuperado = new JardinInteractivoService(authFor(101));
    expect(recuperado.estado()).toEqual({
      xp: 0, actividadesCompletadas: 0, plantas: [], decoracion: 'natural', modoNoche: false
    });
  });

  it('usa el estado inicial si no hay estado guardado', () => {
    localStorage.removeItem('serenity_jardin_interactivo_v1_101');
    const recuperado = new JardinInteractivoService(authFor(101));
    expect(recuperado.estado()).toEqual({
      xp: 0, actividadesCompletadas: 0, plantas: [], decoracion: 'natural', modoNoche: false
    });
  });

  it('recupera el estado inicial desde JSON corrupto con forma inesperada', () => {
    localStorage.setItem('serenity_jardin_interactivo_v1_101', 'null');
    const recuperado = new JardinInteractivoService(authFor(101));
    expect(recuperado.estado()).toEqual({
      xp: 0, actividadesCompletadas: 0, plantas: [], decoracion: 'natural', modoNoche: false
    });
  });

  it('limita el jardín a ochenta plantas', () => {
    for (let i = 0; i < 85; i++) service.sembrarSemilla();
    expect(service.estado().plantas.length).toBe(80);
  });

  it('vincula un registro del backend con una semilla de actividad existente', () => {
    service.registrarActividad('respiracion');
    const semilla = service.estado().plantas[0];

    const registro: RegistroJardin = {
      idJardin: 77,
      idUsuario: 101,
      tipoPlanta: 'Lavanda de calma',
      fechaRegistro: semilla.creadaEn
    };
    service.sincronizarRegistros([registro]);

    expect(service.estado().plantas.length).toBe(1);
    expect(service.estado().plantas[0].idBackend).toBe(77);
  });

  it('importa tipos y etapas de plantas desde registros del backend sin duplicarlos', () => {
    const dias = (cantidad: number) =>
      new Date(Date.now() - cantidad * 86_400_000).toISOString();
    const registros: RegistroJardin[] = [
      { idJardin: 1, idUsuario: 101, tipoPlanta: 'Girasol', fechaRegistro: dias(8) },
      { idJardin: 2, idUsuario: 101, tipoPlanta: 'Tulipán', fechaRegistro: dias(4) },
      { idJardin: 3, idUsuario: 101, tipoPlanta: 'Lavanda', fechaRegistro: dias(2) }
    ];

    service.sincronizarRegistros(registros);
    expect(service.estado().plantas.length).toBe(3);
    expect(service.estado().plantas.find(p => p.idBackend === 1)?.etapa).toBe('floracion');
    expect(service.estado().plantas.find(p => p.idBackend === 2)?.etapa).toBe('planta');
    expect(service.estado().plantas.find(p => p.idBackend === 3)?.etapa).toBe('brote');

    service.sincronizarRegistros(registros);
    expect(service.estado().plantas.length).toBe(3);
  });

  it('ignora una lista vacía de registros del backend', () => {
    service.sembrarSemilla();
    service.sincronizarRegistros([]);
    expect(service.estado().plantas.length).toBe(1);
  });
});

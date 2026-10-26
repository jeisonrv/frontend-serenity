import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { RegistroJardin } from '../models/jardin.model';

export type EtapaPlanta = 'semilla' | 'brote' | 'planta' | 'floracion';
export type TipoPlanta = 'lavanda' | 'girasol' | 'tulipan';
export type DecoracionJardin = 'natural' | 'mariposas' | 'faroles' | 'fuente';

export interface PlantaInteractiva {
  id: string;
  /** ID de la API, cuando la planta proviene de un registro existente. */
  idBackend?: number;
  tipo: TipoPlanta;
  nombre: string;
  etapa: EtapaPlanta;
  riegos: number;
  actividadOrigen?: string;
  creadaEn: string;
}

export interface EstadoJardinInteractivo {
  xp: number;
  actividadesCompletadas: number;
  plantas: PlantaInteractiva[];
  decoracion: DecoracionJardin;
  modoNoche: boolean;
}

const ESTADO_INICIAL: EstadoJardinInteractivo = {
  xp: 0,
  actividadesCompletadas: 0,
  plantas: [],
  decoracion: 'natural',
  modoNoche: false
};

const NOMBRES: Record<TipoPlanta, string> = {
  lavanda: 'Lavanda de calma',
  girasol: 'Girasol de esperanza',
  tulipan: 'Tulipán de serenidad'
};

const TIPOS: TipoPlanta[] = ['lavanda', 'girasol', 'tulipan'];

const DECORACIONES: Record<DecoracionJardin, number> = {
  natural: 0,
  mariposas: 40,
  faroles: 80,
  fuente: 140
};

@Injectable({ providedIn: 'root' })
export class JardinInteractivoService {
  private readonly estadoInterno = signal<EstadoJardinInteractivo>({ ...ESTADO_INICIAL, plantas: [] });
  readonly estado = this.estadoInterno.asReadonly();

  constructor(private readonly auth: AuthService) {
    this.estadoInterno.set(this.leerEstado());
  }

  cargar(): void {
    this.estadoInterno.set(this.leerEstado());
  }

  registrarActividad(tipoActividad: string): void {
    const actual = this.estadoInterno();
    const numero = actual.actividadesCompletadas;
    const tipo = TIPOS[numero % TIPOS.length];
    const semilla: PlantaInteractiva = {
      id: this.nuevoId(),
      tipo,
      nombre: NOMBRES[tipo],
      etapa: 'semilla',
      riegos: 0,
      actividadOrigen: tipoActividad,
      creadaEn: new Date().toISOString()
    };

    this.guardar({
      ...actual,
      xp: actual.xp + 20,
      actividadesCompletadas: numero + 1,
      plantas: [semilla, ...actual.plantas].slice(0, 80)
    });
  }

  sembrarSemilla(tipo: TipoPlanta = 'lavanda'): string {
    const actual = this.estadoInterno();
    const nueva: PlantaInteractiva = {
      id: this.nuevoId(),
      tipo,
      nombre: NOMBRES[tipo],
      etapa: 'semilla',
      riegos: 0,
      creadaEn: new Date().toISOString()
    };
    this.guardar({ ...actual, plantas: [nueva, ...actual.plantas].slice(0, 80) });
    return nueva.id;
  }

  regarPlanta(id: string): EtapaPlanta | null {
    const actual = this.estadoInterno();
    const planta = actual.plantas.find((item) => item.id === id);
    if (!planta || planta.riegos >= 3) return null;

    const riegos = planta.riegos + 1;
    const etapa: EtapaPlanta = riegos === 1 ? 'brote' : riegos === 2 ? 'planta' : 'floracion';
    this.guardar({
      ...actual,
      xp: actual.xp + 5,
      plantas: actual.plantas.map((item) => item.id === id ? { ...item, riegos, etapa } : item)
    });
    return etapa;
  }

  cambiarTipoPlanta(id: string, tipo: TipoPlanta): void {
    const actual = this.estadoInterno();
    this.guardar({
      ...actual,
      plantas: actual.plantas.map((item) => item.id === id
        ? { ...item, tipo, nombre: NOMBRES[tipo] }
        : item)
    });
  }

  decoracionDesbloqueada(decoracion: DecoracionJardin): boolean {
    return this.estadoInterno().xp >= DECORACIONES[decoracion];
  }

  seleccionarDecoracion(decoracion: DecoracionJardin): boolean {
    if (!this.decoracionDesbloqueada(decoracion)) return false;
    this.guardar({ ...this.estadoInterno(), decoracion });
    return true;
  }

  alternarAmbiente(): void {
    const actual = this.estadoInterno();
    this.guardar({ ...actual, modoNoche: !actual.modoNoche });
  }

  private guardar(estado: EstadoJardinInteractivo): void {
    this.estadoInterno.set(estado);
    try {
      localStorage.setItem(this.claveAlmacenamiento(), JSON.stringify(estado));
    } catch {
      // Si el navegador bloquea el almacenamiento, el jardín sigue funcionando en memoria.
    }
  }

  private leerEstado(): EstadoJardinInteractivo {
    try {
      const raw = localStorage.getItem(this.claveAlmacenamiento());
      if (!raw) return { ...ESTADO_INICIAL, plantas: [] };
      const guardado = JSON.parse(raw) as Partial<EstadoJardinInteractivo>;
      return {
        ...ESTADO_INICIAL,
        ...guardado,
        xp: Number.isFinite(guardado.xp) ? Math.max(0, Number(guardado.xp)) : 0,
        actividadesCompletadas: Number.isFinite(guardado.actividadesCompletadas)
          ? Math.max(0, Number(guardado.actividadesCompletadas))
          : 0,
        plantas: Array.isArray(guardado.plantas) ? guardado.plantas.filter(
          (planta): planta is PlantaInteractiva => Boolean(planta && typeof planta.id === 'string')
        ) : []
      };
    } catch {
      return { ...ESTADO_INICIAL, plantas: [] };
    }
  }

  private claveAlmacenamiento(): string {
    const usuario = this.auth.usuario();
    const identidad = usuario?.id ?? usuario?.username ?? 'local';
    return `serenity_jardin_interactivo_v1_${String(identidad)}`;
  }

  private nuevoId(): string {
    return `planta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  sincronizarRegistros(registros: RegistroJardin[]): void {
    if (!Array.isArray(registros) || registros.length === 0) return;
    const actual = this.estadoInterno();
    const idsConocidos = new Set(
      actual.plantas.filter((planta) => planta.idBackend !== undefined).map((planta) => planta.idBackend)
    );

    const nuevas = registros
      .filter((registro) => Number.isFinite(registro.idJardin) && !idsConocidos.has(registro.idJardin))
      .map((registro): PlantaInteractiva => {
        const texto = (registro.tipoPlanta || '').toLocaleLowerCase();
        const tipo: TipoPlanta = texto.includes('girasol') ? 'girasol'
          : texto.includes('tulip') ? 'tulipan' : 'lavanda';
        const fecha = new Date(registro.fechaRegistro);
        const dias = Number.isNaN(fecha.getTime())
          ? 0
          : Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 86_400_000));
        const etapa: EtapaPlanta = dias >= 7 ? 'floracion' : dias >= 3 ? 'planta' : dias >= 1 ? 'brote' : 'semilla';
        const riegos = etapa === 'floracion' ? 3 : etapa === 'planta' ? 2 : etapa === 'brote' ? 1 : 0;
        return {
          id: `registro-${registro.idJardin}`,
          idBackend: registro.idJardin,
          tipo,
          nombre: registro.tipoPlanta || NOMBRES[tipo],
          etapa,
          riegos,
          creadaEn: registro.fechaRegistro
        };
      });

    if (nuevas.length > 0) {
      this.guardar({ ...actual, plantas: [...nuevas, ...actual.plantas].slice(0, 80) });
    }
  }
}

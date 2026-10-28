import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const browserId = 'browser' as unknown as object;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('restaura el tema oscuro guardado', () => {
    localStorage.setItem('serenity-theme', 'dark');
    const service = new ThemeService(browserId, document);
    expect(service.oscuro()).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('establece un tema y lo persiste en localStorage', () => {
    localStorage.setItem('serenity-theme', 'light');
    const service = new ThemeService(browserId, document);
    service.establecer('dark');
    expect(service.oscuro()).toBeTrue();
    expect(localStorage.getItem('serenity-theme')).toBe('dark');
    service.establecer('light');
    expect(service.oscuro()).toBeFalse();
    expect(localStorage.getItem('serenity-theme')).toBe('light');
  });

  it('alterna entre oscuro y claro', () => {
    localStorage.setItem('serenity-theme', 'light');
    const service = new ThemeService(browserId, document);
    service.alternar();
    expect(service.oscuro()).toBeTrue();
    service.alternar();
    expect(service.oscuro()).toBeFalse();
  });

  it('continúa funcionando si el almacenamiento está bloqueado', () => {
    localStorage.setItem('serenity-theme', 'light');
    const service = new ThemeService(browserId, document);
    spyOn(Storage.prototype, 'setItem').and.throwError('almacenamiento bloqueado');
    expect(() => service.establecer('dark')).not.toThrow();
    expect(service.oscuro()).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('puede ejecutarse fuera del navegador sin consultar localStorage', () => {
    const spy = spyOn(Storage.prototype, 'getItem').and.callThrough();
    const service = new ThemeService('server' as unknown as object, document);
    expect(service.oscuro()).toBeFalse();
    expect(spy).not.toHaveBeenCalled();
  });
});

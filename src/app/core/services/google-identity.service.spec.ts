import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { GoogleIdentityService } from './google-identity.service';

describe('GoogleIdentityService', () => {
  let service: GoogleIdentityService;
  let originalClientId: string;
  let originalGoogle: unknown;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GoogleIdentityService] });
    service = TestBed.inject(GoogleIdentityService);
    originalClientId = environment.googleClientId;
    originalGoogle = (window as any).google;
  });

  afterEach(() => {
    environment.googleClientId = originalClientId;
    if (originalGoogle === undefined) delete (window as any).google;
    else (window as any).google = originalGoogle;
    document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]')
      .forEach(script => script.remove());
  });

  it('rechaza el render si Google no está configurado', async () => {
    environment.googleClientId = '';
    await expectAsync(service.renderButton(document.createElement('div'), 'signin_with', () => {}))
      .toBeRejectedWithError('Google no está configurado. Puedes continuar con correo y contraseña.');
  });

  it('inicializa el cliente y renderiza el botón con opciones en español', async () => {
    environment.googleClientId = 'client-test';
    const initialize = jasmine.createSpy('initialize');
    const renderButton = jasmine.createSpy('renderButton');
    (window as any).google = { accounts: { id: { initialize, renderButton } } };

    const element = document.createElement('div');
    const cleanup = await service.renderButton(element, 'signin_with', () => {});
    expect(initialize).toHaveBeenCalled();
    expect(initialize.calls.mostRecent().args[0].client_id).toBe('client-test');
    expect(renderButton.calls.mostRecent().args[1]).toEqual({
      theme: 'outline', size: 'large', shape: 'rectangular',
      text: 'signin_with', locale: 'es', width: 320
    });
    cleanup();
    expect(element.childNodes.length).toBe(0);
  });

  it('entrega la credencial válida al callback dentro de Angular', async () => {
    environment.googleClientId = 'client-test';
    let callback: ((response: { credential?: string }) => void) | undefined;
    const initialize = jasmine.createSpy('initialize').and.callFake((options: any) => {
      callback = options.callback;
    });
    const renderButton = jasmine.createSpy('renderButton');
    (window as any).google = { accounts: { id: { initialize, renderButton } } };
    const received = jasmine.createSpy('received');

    await service.renderButton(document.createElement('div'), 'continue_with', received);
    callback?.({ credential: 'credential-token' });
    expect(received).toHaveBeenCalledWith('credential-token');
    callback?.({});
    callback?.({ credential: '' });
    expect(received).toHaveBeenCalledTimes(1);
  });

  it('reutiliza la inicialización del mismo cliente', async () => {
    environment.googleClientId = 'client-test';
    const initialize = jasmine.createSpy('initialize');
    const renderButton = jasmine.createSpy('renderButton');
    (window as any).google = { accounts: { id: { initialize, renderButton } } };
    await service.renderButton(document.createElement('div'), 'signin_with', () => {});
    await service.renderButton(document.createElement('div'), 'signup_with', () => {});
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledTimes(2);
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from './mensaje-error';

describe('mensajeError', () => {
  it('prioriza el detalle del backend', () => {
    const error = new HttpErrorResponse({
      error: { detail: 'Error de prueba' }
    });

    expect(mensajeError(error, 'Error predeterminado'))
      .toBe('Error de prueba');
  });

  it('acepta la propiedad message', () => {
    const error = new HttpErrorResponse({
      error: { message: 'Error de conexión' }
    });

    expect(mensajeError(error, 'Error predeterminado'))
      .toBe('Error de conexión');
  });

  it('acepta la propiedad mensaje', () => {
    const error = new HttpErrorResponse({
      error: { mensaje: 'Sesión expirada' }
    });

    expect(mensajeError(error, 'Error predeterminado'))
      .toBe('Sesión expirada');
  });

  it('devuelve el mensaje predeterminado si no hay mensaje válido', () => {
    const error = new HttpErrorResponse({
      error: { message: '' }
    });

    expect(mensajeError(error, 'Error predeterminado'))
      .toBe('Error predeterminado');
  });
});
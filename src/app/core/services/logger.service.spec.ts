import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';

describe('LoggerService', () => {
  let logger: LoggerService;
  beforeEach(() => logger = new LoggerService());

  it('delegates error and warning messages to console', () => {
    const error = spyOn(console, 'error');
    const warn = spyOn(console, 'warn');
    logger.error('error', 1);
    logger.warn('warning', 2);
    expect(error).toHaveBeenCalledWith('error', 1);
    expect(warn).toHaveBeenCalledWith('warning', 2);
  });

  it('logs info and debug only outside production', () => {
    const info = spyOn(console, 'info');
    const debug = spyOn(console, 'debug');
    const production = environment.production;
    try {
      environment.production = true;
      logger.info('hidden');
      logger.debug('hidden');
      expect(info).not.toHaveBeenCalled();
      expect(debug).not.toHaveBeenCalled();
      environment.production = false;
      logger.info('visible');
      logger.debug('visible');
      expect(info).toHaveBeenCalledWith('visible');
      expect(debug).toHaveBeenCalledWith('visible');
    } finally {
      environment.production = production;
    }
  });
});

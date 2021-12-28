// tslint:disable no-console
import config from './conf.json';

const {
  debugEnabled: DEBUG_ENABLED,
} = config;

export class Logger {
  static log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  static debug(message: string): void {
    if (DEBUG_ENABLED) {
      console.debug(`[DEBUG] ${message}`);
    }
  }

  static warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  static error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }

  static info(message: string): void {
    console.info(`[INFO] ${message}`);
  }
}

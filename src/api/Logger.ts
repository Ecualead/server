/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:13:54-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: Logger.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-03-25T03:43:25-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import winston from 'winston';
const allowedLevels: string[] = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly',
};

/**
 * Base logger API class
 */
export class Logger {
  private static _level: string;
  private _dbg: winston.Logger;

  constructor(component: string) {
    this._dbg = winston.createLogger({
      level: Logger._level || LOG_LEVEL.ERROR,
      format: winston.format.json(),
      defaultMeta: { component: component },
      transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
      ]
    });
  }

  /**
   * Set the global log level
   *
   * @param level  log level to handle
   */
  public static setLogLevel(level: string) {
    Logger._level = allowedLevels.indexOf(level) < 0 ? LOG_LEVEL.ERROR : level;
  }

  /**
   * Show an error log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public error(message: string, meta?: any) {
    this._dbg.log(LOG_LEVEL.ERROR, message, meta);
  }

  /**
   * Show a warning log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public warn(message: string, meta?: any) {
    this._dbg.log(LOG_LEVEL.WARN, message, meta);
  }

  /**
   * Show an info log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public info(message: string, meta?: any) {
    this._dbg.log(LOG_LEVEL.INFO, message, meta);
  }

  /**
   * Show a debug log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public debug(message: string, meta?: any) {
    this._dbg.log(LOG_LEVEL.DEBUG, message, meta);
  }
}

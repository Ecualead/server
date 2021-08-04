/**
 * Copyright (C) 2020 - 2021 IKOA Business Opportunity
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Oportunity Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { LOG_LEVEL } from "../constants/logger.enum";
import winston from "winston";
const allowedLevels: string[] = ["error", "warn", "info", "http", "verbose", "debug", "silly"];

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
      transports: [new winston.transports.Console({ format: winston.format.simple() })]
    });
  }

  /**
   * Set the global log level
   *
   * @param level  log level to handle
   */
  public static setLogLevel(level: string): void {
    Logger._level = allowedLevels.indexOf(level) < 0 ? LOG_LEVEL.ERROR : level;
  }

  /**
   * Get the current log level
   */
  public static get logLevel(): string {
    return Logger._level;
  }

  /**
   * Show an error log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public error(message: string, meta?: any): void {
    this._dbg.log(LOG_LEVEL.ERROR, message, meta);
  }

  /**
   * Show a warning log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public warn(message: string, meta?: any): void {
    this._dbg.log(LOG_LEVEL.WARN, message, meta);
  }

  /**
   * Show an info log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public info(message: string, meta?: any): void {
    this._dbg.log(LOG_LEVEL.INFO, message, meta);
  }

  /**
   * Show a debug log entry
   *
   * @param message  Log message to show
   * @param meta  Additional metadata to show into the log entry
   */
  public debug(message: string, meta?: any): void {
    this._dbg.log(LOG_LEVEL.DEBUG, message, meta);
  }
}

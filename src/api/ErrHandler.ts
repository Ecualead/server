/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:14:08-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ErrHandler.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-01T18:40:45-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import { Logger } from './Logger';

export class ErrHandler {
  private static _instance: ErrHandler;
  private _logger: Logger;

  /**
   * Private constructor to allow singleton class
   */
  private constructor() {
    this._logger = new Logger('ErrHandler');
  }

  /**
   * Retrieve the singleton class instance
   */
  public static get shared(): ErrHandler {
    if (!ErrHandler._instance) {
      ErrHandler._instance = new ErrHandler();
    }
    return ErrHandler._instance;
  }
}

/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:07:14-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ResponseHandler.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-25T06:20:24-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../types/status';
import {Logger} from '../api/Logger';

export class ResponseHandler {
  private static _logger: Logger = new Logger('ResponseHandler');

  /**
   * Send a success response
   */
  public static success(_req: Request, res: Response, _next: NextFunction) {
    res.status(HTTP_STATUS.HTTP_OK).json(res.locals['response']).end();
  }

  /**
   * Send an error response
   */
  public static error(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err.boStatus ? err.boStatus : HTTP_STATUS.HTTP_BAD_REQUEST;
    let error = {
      error: err.boError ? err.boError : HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR,
    }
    if (err.boData) {
      (<any>error)['data'] = err.boData;
    }
    ResponseHandler._logger.error('Request error',{error: err.stack, response: error});
    res.status(status).json(error).end();
  }
}

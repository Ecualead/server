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

export enum HTTP_STATUS {
  HTTP_OK = 200,
  HTTP_CREATED = 201,
  HTTP_PARTIAL_CONTENT = 206,
  HTTP_BAD_REQUEST = 400,
  HTTP_UNAUTHORIZED = 401,
  HTTP_FORBIDDEN = 403,
  HTTP_NOT_FOUND = 404,
  HTTP_NOT_ACCEPTABLE = 406,
  HTTP_CONFLICT = 409,
  HTTP_INTERNAL_SERVER_ERROR = 500,
}

import { Request, Response, NextFunction } from 'express';
import { ErrHandler } from '../api/ErrHandler';

const ErrCtrl = ErrHandler.shared;

export class ResponseHandler {
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
    res.status(status).json(ErrCtrl.parseError(err)).end();
  }
}

/**
 * Copyright (C) 2020-2024 ECUALEAD LLC
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { Request, Response, NextFunction } from "express";
import { IError, SERVER_ERRORS } from "../constants/errors";
import { HTTP_STATUS } from "../constants/http-status";

/**
 * Base middleware to handle express responses
 */
export class ResponseHandler {
  /**
   * Send a success response of the request
   * Success response send the JSON object contained into res.locals
   */
  public static success(_req: Request, res: Response, _next: NextFunction) {
    res.status(HTTP_STATUS.HTTP_2XX_OK).json(res.locals.response ?? {}).end();
  }

  /**
   * Send an error response of the request
   */
  public static error(err: any, _req: Request, res: Response, _next: NextFunction) {
    let errObj: IError = SERVER_ERRORS.GENERAL_ERROR;

    /* Ignore formated errors */
    if (!(err instanceof IError)) {
      /* Check for MongoDB errors */
      if (err.name === "MongoError") {
        switch (err.code) {
          case 11000 /* Duplicated key error */:
            errObj = SERVER_ERRORS.OBJECT_DUPLICATED;
            break;
          default:
            errObj = SERVER_ERRORS.INVALID_OPERATION;
            break;
        }
      } else if (err.code === 401) {
        /* Check OAuth2 errors */
        errObj = SERVER_ERRORS.UNAUTHORIZED;
      } else {
        errObj.data = err;
      }
    }else{
      errObj = err;
    }

    /* Prepare error response */
    const status = errObj.status ?? HTTP_STATUS.HTTP_4XX_BAD_REQUEST;
    const response: any = {
      error: errObj.str ?? SERVER_ERRORS.UNKNOWN_ERROR.str
    };

    /* Check to set error data */
    if (errObj.data) {
      response["data"] = errObj.data;
    }

    res.status(status).json(response).end();
  }
}

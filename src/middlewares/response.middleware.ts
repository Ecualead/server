/**
 * Copyright (C) 2020 - 2022 ECUALEAD
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { Request, Response, NextFunction } from "express";
import { SERVER_ERRORS } from "../constants/errors.enum";
import { Objects } from "../utils/objects.util";
import { HTTP_STATUS } from "../constants/http.status.enum";
import { ErrorCtrl } from "../controllers/error.controller";

/**
 * Base middleware to handle express responses
 */
export class ResponseHandler {
  /**
   * Send a success response of the request
   * Success response send the JSON object contained into res.locals
   */
  public static success(_req: Request, res: Response, _next: NextFunction) {
    res.status(HTTP_STATUS.HTTP_2XX_OK).json(res.locals["response"]).end();
  }

  /**
   * Parse an error response of the request
   */
  public static errorParse(err: any, _req: Request, res: Response, next: NextFunction) {
    res.locals["error"] = ErrorCtrl.parseError(err);
    next(res.locals["error"]);
  }

  /**
   * Send an error response of the request
   */
  public static error(err: any, _req: Request, res: Response, _next: NextFunction) {
    const errObj = ErrorCtrl.parseError(err);

    /* Prepare error response */
    const status = errObj.status ?? HTTP_STATUS.HTTP_4XX_BAD_REQUEST;
    const response: any = {
      error: errObj.value ?? SERVER_ERRORS.UNKNOWN_ERROR.value,
      description: errObj.str ?? SERVER_ERRORS.UNKNOWN_ERROR.str
    };

    /* Check to set error data */
    if (errObj.data) {
      response["data"] = errObj.data;
    }

    res.status(status).json(response).end();
  }
}

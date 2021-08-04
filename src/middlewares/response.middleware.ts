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
   *
   * @param _req  Express request parameter
   * @param res  Express response parameter
   * @param _next  Express next function parameter
   */
  public static success(_req: Request, res: Response, _next: NextFunction) {
    res.status(HTTP_STATUS.HTTP_2XX_OK).json(res.locals["response"]).end();
  }

  /**
   * Parse an error response of the request
   *
   * @param err  Express raised error parameter
   * @param _req  Express request parameter
   * @param res  Express response parameter
   * @param next  Express next function parameter
   */
  public static errorParse(err: any, _req: Request, res: Response, next: NextFunction) {
    res.locals["error"] = ErrorCtrl.parseError(err);
    next(res.locals["error"]);
  }

  /**
   * Send an error response of the request
   *
   * @param err  Express raised error parameter
   * @param _req  Express request parameter
   * @param res  Express response parameter
   * @param _next  Express next function parameter
   */
  public static error(err: any, _req: Request, res: Response, _next: NextFunction) {
    const errObj = ErrorCtrl.parseError(err);

    /* Prepare error response */
    const status = Objects.get(errObj, "boStatus", Objects.get(errObj, "boError.status", HTTP_STATUS.HTTP_4XX_BAD_REQUEST));
    const response: any = {
      error: Objects.get(errObj, "boError.value", SERVER_ERRORS.UNKNOWN_ERROR.value),
      description: Objects.get(errObj, "boError.str", SERVER_ERRORS.UNKNOWN_ERROR.str)
    };

    /* Check to set error data */
    if (errObj.boData) {
      response["data"] = errObj.boData;
    }

    res.status(status).json(response).end();
  }
}

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
import { HTTP_STATUS } from "@ikoabo/core";
import { Request, Response, NextFunction } from "express";
import { ErrorCtrl } from "../controllers/error.controller";

/**
 * Base middlewares to handle express responses
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
    res.status(errObj.status).json(errObj.response).end();
  }
}

/**
 * Copyright (C) 2023 ECUALEAD
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { SERVER_ERRORS } from "../constants/errors.enum";
import { HTTP_STATUS } from "../constants/http.status.enum";
import { Request, Response, NextFunction } from "express";

export function FormURLEncoded(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers["content-type"];
  if (contentType !== "application/x-www-form-urlencoded") {
    return next({
      boError: SERVER_ERRORS.INVALID_OPERATION,
      boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
    });
  }
  next();
}

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
import { SERVER_ERRORS } from "../constants/errors";
import { HTTP_STATUS } from "../constants/http-status";
import { Request, Response, NextFunction } from "express";

export const FORM_URL_ENCODED = "application/x-www-form-urlencoded";

/**
 * Middleware to validate the request content type
 *
 * @param type Expected content type
 */
export const ContentType = (type: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];
    if (contentType !== "application/x-www-form-urlencoded") {
      return next({
        boError: SERVER_ERRORS.INVALID_OPERATION,
        boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
      });
    }
    next();
  };
}

/**
 * Middleware to validate the request content type as Form URL Encoded
 */
export const FormURLEncoded = ContentType(FORM_URL_ENCODED);


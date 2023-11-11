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
import { IError } from "../controllers/error.controller";
import { HTTP_STATUS } from "./http.status.enum";

export interface IServiceErrors {
  [key: string]: IError;
}

/**
 * Predefined server errors
 */
export const SERVER_ERRORS: IServiceErrors = {
  UNKNOWN_ERROR: new IError(500, "unknown-error", HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR),
  INVALID_OPERATION: new IError(400, "invalid-operation", HTTP_STATUS.HTTP_4XX_FORBIDDEN),
  INVALID_FIELDS: new IError(406, "invalid-fields", HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE),
  INVALID_FORM_CONTENT_TYPE: new IError(406, "invalid-form-content-type", HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE),
  OBJECT_DUPLICATED: new IError(403, "object-duplicated", HTTP_STATUS.HTTP_4XX_CONFLICT),
  OBJECT_NOT_FOUND: new IError(404, "object-not-found", HTTP_STATUS.HTTP_4XX_NOT_FOUND),
  UNAUTHORIZED: new IError(401, "unauthorized", HTTP_STATUS.HTTP_4XX_UNAUTHORIZED),
};

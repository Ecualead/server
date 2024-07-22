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
import { HTTP_STATUS } from "./http-status";

export class IError {
  public str: string;
  public status?: HTTP_STATUS;
  public data?: any;

  constructor(str: string, status: HTTP_STATUS = HTTP_STATUS.HTTP_4XX_BAD_REQUEST, data?: any) {
    this.str = str;
    this.status = status;
    this.data = data;
  }
}

export interface IErrors {
  [key: string]: IError;
}

/**
 * Predefined server errors
 */
export const SERVER_ERRORS: IErrors = {
  UNKNOWN_ERROR: new IError("unknown-error", HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR),
  INVALID_OPERATION: new IError("invalid-operation", HTTP_STATUS.HTTP_4XX_FORBIDDEN),
  INVALID_FIELDS: new IError("invalid-fields", HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE),
  INVALID_CONTENT_TYPE: new IError("invalid-content-type", HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE),
  DUPLICATED: new IError("duplicated", HTTP_STATUS.HTTP_4XX_CONFLICT),
  NOT_FOUND: new IError("not-found", HTTP_STATUS.HTTP_4XX_NOT_FOUND),
  UNAUTHORIZED: new IError("unauthorized", HTTP_STATUS.HTTP_4XX_UNAUTHORIZED),
  GENERAL_ERROR: new IError("error", HTTP_STATUS.HTTP_4XX_BAD_REQUEST),
};

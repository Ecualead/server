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
import { SERVER_ERRORS } from "../constants/errors.enum";
import { HTTP_STATUS } from "../constants/http.status.enum";
import { Logger } from "./logger.controller";

export interface IErrorResponse{
  boError: IError;
  boStatus?: HTTP_STATUS;
  boData?: any;
}

export interface IError{
  value: number;
  str?: string;
  status?: HTTP_STATUS;
}

/**
 * Errors controller
 * Parse generated errors to asign specific code error and response status
 */
class Errors {
  private static _instance: Errors;
  private _logger: Logger;

  /**
   * Private constructor to allow singleton class
   */
  private constructor() {
    this._logger = new Logger("ErrorHandler");
  }

  /**
   * Retrieve the singleton class instance
   */
  public static get shared(): Errors {
    if (!Errors._instance) {
      Errors._instance = new Errors();
    }
    return Errors._instance;
  }

  /**
   * Parse the error information to provide a response
   *
   * @param err
   */
  parseError(err: any): IErrorResponse {
    const error: any = {
      status: err.boStatus ? err.boStatus : HTTP_STATUS.HTTP_4XX_BAD_REQUEST,
      response: {
        error: err.boError.value || SERVER_ERRORS.UNKNOWN_ERROR.value,
        description: err.boError.str || SERVER_ERRORS.UNKNOWN_ERROR.str
      }
    };
    if (err.boData) {
      error.response["data"] = err.boData;
    }

    /* Check for MongoDB errors */
    if (err.name === "MongoError") {
      switch (err.code) {
        case 11000 /* Duplicated key error */:
          error.response.error = SERVER_ERRORS.OBJECT_DUPLICATED.value;
          error.response.description = SERVER_ERRORS.OBJECT_DUPLICATED.str;
          error.status = HTTP_STATUS.HTTP_4XX_CONFLICT;
          break;
        default:
          error.response.error = SERVER_ERRORS.INVALID_OPERATION.value;
          error.response.description = SERVER_ERRORS.INVALID_OPERATION.str;
          error.status = HTTP_STATUS.HTTP_4XX_BAD_REQUEST;
      }
    } else {
      /* Check OAuth2 errors */
      if (err.code) {
        switch (err.code) {
          case 401:
            error.response.error = SERVER_ERRORS.INVALID_OPERATION.value;
            error.response.description = SERVER_ERRORS.INVALID_OPERATION.str;
            error.status = HTTP_STATUS.HTTP_4XX_UNAUTHORIZED;
            break;

          default:
            error.response.error = SERVER_ERRORS.INVALID_OPERATION.value;
            error.response.description = SERVER_ERRORS.INVALID_OPERATION.str;
            error.status = err.status || HTTP_STATUS.HTTP_4XX_FORBIDDEN;
        }
      }
    }

    this._logger.error("Request error", { error: err, stack: err.stack, response: error });
    return error;
  }
}

export const ErrorCtrl = Errors.shared;

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
import { HTTP_STATUS, SERVER_ERRORS, Logger } from "@ikoabo/core";

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
  parseError(err: any) {
    const error: any = {
      status: err.boStatus ? err.boStatus : HTTP_STATUS.HTTP_4XX_BAD_REQUEST,
      response: {
        error: err.boError ? err.boError : SERVER_ERRORS.UNKNOW_ERROR
      }
    };
    if (err.boData) {
      error.response["data"] = err.boData;
    }

    /* Check for MongoDB errors */
    if (err.name === "MongoError") {
      switch (err.code) {
        case 11000 /* Duplicated key error */:
          error.response.error = SERVER_ERRORS.OBJECT_DUPLICATED;
          error.status = HTTP_STATUS.HTTP_4XX_CONFLICT;
          break;
        default:
          error.response.error = SERVER_ERRORS.INVALID_OPERATION;
          error.status = HTTP_STATUS.HTTP_4XX_BAD_REQUEST;
      }
    } else {
      /* Check OAuth2 errors */
      if (err.code) {
        switch (err.code) {
          case 401:
            error.response.error = SERVER_ERRORS.INVALID_OPERATION;
            error.status = HTTP_STATUS.HTTP_4XX_UNAUTHORIZED;
            break;

          default:
            error.response.error = SERVER_ERRORS.INVALID_OPERATION;
            error.status = err.status || HTTP_STATUS.HTTP_4XX_FORBIDDEN;
        }
      }
    }

    this._logger.error("Request error", { error: err.stack, response: error });
    return error;
  }
}

export const ErrorCtrl = Errors.shared;

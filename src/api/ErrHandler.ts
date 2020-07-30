/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:14:08-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ErrHandler.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-01T18:40:45-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import { Logger } from "./Logger";
import { HTTP_STATUS } from "../middlewares/ResponseHandler";
import { ERRORS } from "../types/errors";

export class ErrHandler {
  private static _instance: ErrHandler;
  private _logger: Logger;

  /**
   * Private constructor to allow singleton class
   */
  private constructor() {
    this._logger = new Logger("ErrHandler");
  }

  /**
   * Retrieve the singleton class instance
   */
  public static get shared(): ErrHandler {
    if (!ErrHandler._instance) {
      ErrHandler._instance = new ErrHandler();
    }
    return ErrHandler._instance;
  }

  /**
   * Parse the error information to provide a response
   *
   * @param err
   */
  parseError(err: any) {
    let error = {
      status: err.boStatus ? err.boStatus : HTTP_STATUS.HTTP_BAD_REQUEST,
      response: {
        error: err.boError
          ? err.boError
          : HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR,
      },
    };
    if (err.boData) {
      (<any>error.response)["data"] = err.boData;
    }

    /* Check for MongoDB errors */
    if (err.name === "MongoError") {
      switch (err.code) {
        case 11000 /* Duplicated key error */:
          error.response.error = ERRORS.OBJECT_DUPLICATED;
          error.status = HTTP_STATUS.HTTP_CONFLICT;
          break;
        default:
          error.response.error = ERRORS.INVALID_OPERATION;
          error.status = HTTP_STATUS.HTTP_BAD_REQUEST;
      }
    } else {
      /* Check OAuth2 errors */
      if (err.code) {
        switch (err.code) {
          case 401:
            error.response.error = ERRORS.INVALID_OPERATION;
            error.status = HTTP_STATUS.HTTP_UNAUTHORIZED;
            break;

          default:
            error.response.error = ERRORS.INVALID_OPERATION;
            error.status = err.status || HTTP_STATUS.HTTP_FORBIDDEN;
        }
      }
    }

    this._logger.error("Request error", { error: err.stack, response: error });
    return error;
  }
}

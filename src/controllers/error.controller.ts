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

export interface IErrorResponse {
  boError: IError;
  boStatus?: HTTP_STATUS;
  boData?: any;
}

export interface IError {
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
    this._logger.error("Request error", { error: err, stack: err.stack });

    /* Bypass formatted error */
    if (err.boError) {
      return {
        boError: err.boError,
        boStatus: err.boStatus,
        boData: err.boData,
      };
    }

    /* Check for MongoDB errors */
    if (err.name === "MongoError") {
      switch (err.code) {
        case 11000 /* Duplicated key error */:
          return { boError: SERVER_ERRORS.OBJECT_DUPLICATED };
        default:
          return { boError: SERVER_ERRORS.INVALID_OPERATION };
      }
    }

    /* Check OAuth2 errors */
    if (err.code === 401) {
      return { boError: SERVER_ERRORS.INVALID_OPERATION, boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED };
    }

    return { boError: SERVER_ERRORS.INVALID_OPERATION, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN };
  }
}

export const ErrorCtrl = Errors.shared;

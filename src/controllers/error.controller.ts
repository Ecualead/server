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
import { SERVER_ERRORS } from "../constants/errors.enum";
import { HTTP_STATUS } from "../constants/http.status.enum";
import { Logger } from "./logger.controller";

export class IError {
  public value: number;
  public str?: string;
  public status?: HTTP_STATUS;
  public data?: any;

  constructor(value: number, str?: string, status?: HTTP_STATUS, data?: any) {
    this.value = value;
    this.str = str;
    this.status = status;
    this.data = data;
  }
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
  parseError(error: any): IError {
    this._logger.error("Request error", { error, stack: error.stack });

    /* Bypass formatted error */
    if (error instanceof IError) {
      return error;
    }

    /* Check for MongoDB errors */
    if (error.name === "MongoError") {
      switch (error.code) {
        case 11000 /* Duplicated key error */:
          return SERVER_ERRORS.OBJECT_DUPLICATED;
        default:
          return SERVER_ERRORS.INVALID_OPERATION;
      }
    }

    /* Check OAuth2 errors */
    if (error.code === 401) {
      return SERVER_ERRORS.UNAUTHORIZED;
    }

    return SERVER_ERRORS.INVALID_OPERATION;
  }
}

export const ErrorCtrl = Errors.shared;

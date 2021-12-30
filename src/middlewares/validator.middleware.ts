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
import JoiBase from "joi";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { SERVER_ERRORS } from "../constants/errors.enum";

/**
 * Custom JOI validator to validate ObjectId
 */
const CustomJoi = JoiBase.extend((joi) => {
  return {
    type: "objectId",
    base: joi.string().min(24).max(24),
    messages: {
      "objectId.invalid": '"{{#label}}" isn\'t a valid ObjectId'
    },
    validate(value, helpers) {
      /* Validate value against Mongoose ObjectId validator */
      if (!mongoose.isValidObjectId(value)) {
        return { value, errors: helpers.error("objectId.invalid") };
      }

      return null;
    }
  };
});
export const Joi = CustomJoi;

/**
 * Predefined ObjectId validator with :id parameter
 */
export const ValidateObjectId = CustomJoi.object().keys({
  id: CustomJoi.objectId().required()
});

/**
 * Validator class to wrap JOI validation with express middleware
 */
export class Validator {
  /**
   * JOI error parser
   *
   * @param err  Raised error
   */
  private static _handleErr(err: any) {
    const fields: string[] = [];
    (err.details || []).forEach((value: any) => {
      if (Array.isArray(value["path"]) && value["path"].length > 0) {
        fields.push(value["path"][value["path"].length - 1]);
      }
    });
    return {
      boError: SERVER_ERRORS.INVALID_FIELDS,
      boData: { fields: fields }
    };
  }

  /**
   * Return middleware to validate request with JOI schema
   */
  public static joi(schema: any, reqField = "body") {
    return (req: Request, _res: Response, next: NextFunction) => {
      const reqTmp: any = req;
      try {
        Joi.attempt(reqTmp[reqField], schema, { abortEarly: false, convert: true });
      } catch (err) {
        next(Validator._handleErr(err));
        return;
      }
      next();
    };
  }
}

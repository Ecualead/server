/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { Request, Response, NextFunction } from 'express';
import JoiBase from '@hapi/joi';
import mongoose from 'mongoose';
import { SERVER_ERRORS, HTTP_STATUS } from '@ikoabo/core';

/**
 * Custom JOI validator to validate ObjectId
 */
const CustomJoi = JoiBase.extend((joi) => {
  return {
    type: 'objectId',
    base: joi.string().min(24).max(24),
    messages: {
      'objectId.invalid': '"{{#label}}" isn\'t a valid ObjectId',
    },
    validate(value, helpers) {
      /* Validate value against Mongoose ObjectId validator */
      if (!mongoose.isValidObjectId(value)) {
        return { value, errors: helpers.error('objectId.invalid') };
      }
    },
  };
});
export const Joi = CustomJoi;

/**
 * Predefined ObjectId validator with :id parameter
 */
export const ValidateObjectId = CustomJoi.object().keys({
  id: CustomJoi.objectId().required(),
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
    let fields: string[] = [];
    (err.details || []).forEach((value: any) => {
      if (Array.isArray(value['path']) && value['path'].length > 0) {
        fields.push(value['path'][value['path'].length - 1])
      }
    });
    return {
      boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE,
      boError: SERVER_ERRORS.INVALID_FIELDS,
      boData: { fields: fields }
    };
  }

  /**
   * Return middleware to validate request with JOI schema
   * 
   * @param schema  JOI validator schema to be evaluated
   * @param reqField  Request field to apply the validation schema
   */
  public static joi(schema: any, reqField: string = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        Joi.attempt((<any>req)[reqField], schema, { abortEarly: false });
      } catch (err) {
        next(Validator._handleErr(err));
        return;
      }
      next();
    };
  }
}
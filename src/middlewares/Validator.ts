/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:09:12-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: Validator.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-12T21:55:42-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import JoiBase from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import { ERRORS } from '@/types/errors';
import mongoose from 'mongoose';

const CustomJoi = JoiBase.extend((joi) => {
  return {
    type: 'objectId',
    base: joi.string().required().min(24).max(24),
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

export class Validators {
  /**
   * Return middleware to validate request with JOI schema
   */
  public static joi(schema: any, reqField: string = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
      const result = Joi.attempt((<any>req)[reqField], schema, { abortEarly: false });
      if (result.error) {
        let fields: string[] = [];
        result.error.details.forEach((value: any) => {
          if (Array.isArray(value['path']) && value['path'].length > 0) {
            fields.push(value['path'][value['path'].length - 1])
          }
        });
        next({
          boError: ERRORS.INVALID_FIELDS,
          boData: { fields: fields }
        });
        return;
      }
      next();
    };
  }
}

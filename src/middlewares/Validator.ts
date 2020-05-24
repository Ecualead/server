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

import { Joi } from './ValidatorObjectId';
import { Request, Response, NextFunction } from 'express';
import { ERRORS } from '../types/errors';

export class Validators {
  private static _handleErr(err: any) {
    let fields: string[] = [];
    (err.details || []).forEach((value: any) => {
      if (Array.isArray(value['path']) && value['path'].length > 0) {
        fields.push(value['path'][value['path'].length - 1])
      }
    });
    return {
      boError: ERRORS.INVALID_FIELDS,
      boData: { fields: fields }
    };
  }

  /**
   * Return middleware to validate request with JOI schema
   */
  public static joi(schema: any, reqField: string = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        Joi.attempt((<any>req)[reqField], schema, { abortEarly: false });
      } catch (err) {
        next(Validators._handleErr(err));
        return;
      }
      next();
    };
  }
}

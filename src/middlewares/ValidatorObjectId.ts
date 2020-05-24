/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:09:12-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ValidatorObjectId.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-12T21:55:42-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import JoiBase from '@hapi/joi';
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

export const ValidateObjectId = CustomJoi.object().keys({
  id: CustomJoi.objectId(),
});

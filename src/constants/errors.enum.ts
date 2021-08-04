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

/**
 * Predefined server errors
 */
export const SERVER_ERRORS = {
  UNKNOWN_ERROR: {
    value: 500,
    str: "unknown-error"
  },
  INVALID_OPERATION: {
    value: 501,
    str: "invalid-operation"
  },
  INVALID_FIELDS: {
    value: 502,
    str: "invalid-fields"
  },
  OBJECT_DUPLICATED: {
    value: 503,
    str: "object-duplicated"
  },
  OBJECT_NOT_FOUND: {
    value: 504,
    str: "object-not-found"
  },
  INVALID_OWNER: {
    value: 505,
    str: "invalid-owner"
  }
};

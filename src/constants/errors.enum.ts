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

import { HTTP_STATUS } from "./http.status.enum";

/**
 * Predefined server errors
 */
export const SERVER_ERRORS = {
  UNKNOWN_ERROR: {
    value: 500,
    str: "unknown-error",
    status: HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR
  },
  INVALID_OPERATION: {
    value: 501,
    str: "invalid-operation",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_FIELDS: {
    value: 502,
    str: "invalid-fields",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  OBJECT_DUPLICATED: {
    value: 503,
    str: "object-duplicated",
    status: HTTP_STATUS.HTTP_4XX_CONFLICT
  },
  OBJECT_NOT_FOUND: {
    value: 504,
    str: "object-not-found",
    status: HTTP_STATUS.HTTP_4XX_NOT_FOUND
  },
  INVALID_OWNER: {
    value: 505,
    str: "invalid-owner",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  }
};

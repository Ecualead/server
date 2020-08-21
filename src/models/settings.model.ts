/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 */

/**
 * Base interface for service settings
 */
export interface ISettings {
  /* Service information */
  SERVICE: {
    NOT_TRUST_PROXY?: boolean;
    NOT_CORS?: boolean;
    NOT_METHOD_OVERRIDE?: boolean;
    NOT_BODY_PARSER?: boolean;
    NOT_REAL_IP?: boolean;
  };

  /* Database connection */
  MONGODB: {
    URI: string;
    POOL_SIZE?: number;
    NOT_AUTO_INDEX?: boolean;
    NOT_USE_CREATE_INDEX?: boolean;
    NOT_USE_NEW_URL_PARSER?: boolean;
    NOT_USE_UNIFIED_TOPOLOGY?: boolean;
  };

  /* Additional settings */
  [key: string]: any;
}

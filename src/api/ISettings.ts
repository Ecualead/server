/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:13:17-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ISetting.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-12T23:28:24-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

/**
 * Base interface for service settings
 */
export interface ISettings {
  /* Service information */
  SERVICE: {
    NAME: string;
    LOG: string;
    PORT: number;
    INTERFACE?: string;
    ENV?: string;
    INSTANCES: number;
    NOT_TRUST_PROXY?: boolean;
    NOT_CORS?: boolean;
    NOT_METHOD_OVERRIDE?: boolean;
    NOT_BODY_PARSER?: boolean;
    NOT_REAL_IP?: boolean;
  };

  /* Service authentication */
  AUTH?: {
    SERVER: string;
    ID: string;
    SECRET: string;
  }

  /* Service version */
  VERSION: {
    MAIN: number;
    MINOR: number;
    REVISION: number;
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

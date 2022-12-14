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

/**
 * HTTP response status codes
 * https://www.restapitutorial.com/httpstatuscodes.html
 * https://developer.mozilla.org/es/docs/Web/HTTP/Status
 * http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 */
export enum HTTP_STATUS {
  /* 1xx Informational */
  HTTP_1XX_CONTINUE = 100,
  HTTP_1XX_SWITCHING_PROTOCOLS = 101,
  HTTP_1XX_WEBDAV_PROCESSING = 102,
  HTTP_1XX_CHECKPOINT = 103,

  /* 2xx Success */
  HTTP_2XX_OK = 200,
  HTTP_2XX_CREATED = 201,
  HTTP_2XX_ACCEPTED = 202,
  HTTP_2XX_NON_AUTHORITATIVE_INFORMATION = 203,
  HTTP_2XX_NO_CONTENT = 204,
  HTTP_2XX_RESET_CONTENT = 205,
  HTTP_2XX_PARTIAL_CONTENT = 206,
  HTTP_2XX_WEBDAV_MULTI_STATUS = 207,
  HTTP_2XX_WEBDAV_ALREADY_REPORTED = 208,
  HTTP_2XX_IM_USED = 226,

  /* 3xx Redirection */
  HTTP_3XX_MULTIPLE_CHOICES = 300,
  HTTP_3XX_MOVED_PERMANENTLY = 301,
  HTTP_3XX_FOUND = 302,
  HTTP_3XX_SEE_OTHER = 303,
  HTTP_3XX_NOT_MODIFIED = 304,
  HTTP_3XX_USER_PROXY = 305,
  HTTP_3XX_TEMPORALLY_REDIRECT = 307,
  HTTP_3XX_PERMANENT_REDIRECT = 308,

  /* 4xx Client Error */
  HTTP_4XX_BAD_REQUEST = 400,
  HTTP_4XX_UNAUTHORIZED = 401,
  HTTP_4XX_PAYMENT_REQUIRED = 402,
  HTTP_4XX_FORBIDDEN = 403,
  HTTP_4XX_NOT_FOUND = 404,
  HTTP_4XX_METHOD_NOT_ALLOWED = 405,
  HTTP_4XX_NOT_ACCEPTABLE = 406,
  HTTP_4XX_PROXY_AUTHENTICATION_REQUIRED = 407,
  HTTP_4XX_REQUEST_TIMEOUT = 408,
  HTTP_4XX_CONFLICT = 409,
  HTTP_4XX_GONE = 410,
  HTTP_4XX_LENGTH_REQUIRED = 411,
  HTTP_4XX_PRECONDITION_FAILED = 412,
  HTTP_4XX_REQUEST_ENTITY_TOO_LARGE = 413,
  HTTP_4XX_REQUEST_URI_TOO_LONG = 414,
  HTTP_4XX_UNSUPPORTED_MEDIA_TYPE = 415,
  HTTP_4XX_REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  HTTP_4XX_EXPECTATION_FAILED = 417,
  HTTP_4XX_I_AM_TEAPOT = 418,
  HTTP_4XX_TWITTER_ENHANCE_YOUR_CALM = 420,
  HTTP_4XX_MISDIRECTED_REQUEST = 421,
  HTTP_4XX_WEBDAV_UNPROCESSABLE_ENTITY = 422,
  HTTP_4XX_WEBDAV_LOCKED = 423,
  HTTP_4XX_WEBDAV_FAILED_DEPENDENCY = 424,
  HTTP_4XX_WEBDAV_RESERVED = 425,
  HTTP_4XX_UPGRADE_REQUIRED = 426,
  HTTP_4XX_PRECONDITION_REQUIRED = 428,
  HTTP_4XX_TOO_MANY_REQUESTS = 429,
  HTTP_4XX_REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  HTTP_4XX_NGINX_NO_RESPONSE = 444,
  HTTP_4XX_MICROSOFT_RETRY_WITH = 449,
  HTTP_4XX_MICROSOFT_BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS = 450,
  HTTP_4XX_UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  HTTP_4XX_NGINX_CLIENT_CLOSED_REQUEST = 499,

  /* 5xx Server Error */
  HTTP_5XX_INTERNAL_SERVER_ERROR = 500,
  HTTP_5XX_NOT_IMPLEMENTED = 501,
  HTTP_5XX_BAD_GATEWAY = 502,
  HTTP_5XX_SERVICE_UNAVAILABLE = 503,
  HTTP_5XX_GATEWAY_TIMEOUT = 504,
  HTTP_5XX_HTTP_VERSION_NOT_SUPPORTED = 505,
  HTTP_5XX_VARIANT_ALSO_NEGOTIATES = 506,
  HTTP_5XX_WEBDAV_INSUFFICIENT_STORAGE = 507,
  HTTP_5XX_WEBDAV_LOOP_DETECTED = 508,
  HTTP_5XX_APACHE_BANDWITH_LIMIT_EXCEEDED = 509,
  HTTP_5XX_NOT_EXTENDED = 510,
  HTTP_5XX_NETWORK_AUTHENTICATION_REQUIRED = 511,
  HTTP_5XX_NETWORK_READ_TIMEOUT = 598,
  HTTP_5XX_NETWORK_CONNECT_TIMEOUT = 599
}

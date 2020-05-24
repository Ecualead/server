/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:04:20-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: status.ts
 * @Last modified by:   Reinier Millo Sánchez
 * @Last modified time: 2020-03-24T04:05:09-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

 export enum BASE_STATUS{
   BS_DELETED = -1,
   BS_UNKNOWN = 0,
 }

 export enum HTTP_STATUS {
   HTTP_OK = 200,
   HTTP_CREATED = 201,
   HTTP_PARTIAL_CONTENT = 206,
   HTTP_BAD_REQUEST = 400,
   HTTP_UNAUTHORIZED = 401,
   HTTP_FORBIDDEN = 403,
   HTTP_NOT_FOUND = 404,
   HTTP_NOT_ACCEPTABLE = 406,
   HTTP_CONFLICT = 409,
   HTTP_INTERNAL_SERVER_ERROR = 500,
 }

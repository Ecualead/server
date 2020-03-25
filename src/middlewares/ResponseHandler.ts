/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:07:14-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: ResponseHandler.ts
 * @Last modified by:   Reinier Millo Sánchez
 * @Last modified time: 2020-03-24T04:08:49-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

 import { Request, Response, NextFunction } from 'express';
 import { HTTP_STATUS } from '../types/status';

 export class ResponseHandler {

   /**
    * Send a success response
    */
   public static success(_req: Request, res: Response, _next: NextFunction) {
     res.status(HTTP_STATUS.HTTP_OK).json(res.locals['response']).end();
   }

   /**
    * Send an error response
    */
   public static error(err: any, _req: Request, res: Response, _next: NextFunction) {
     const status = err.status ? err.status : HTTP_STATUS.HTTP_BAD_REQUEST;
     let error = {
       error: err.error,
     }
     if (err.data) {
       (<any>error)['data'] = err.data;
     }
     res.status(status).json(error).end();
   }
 }

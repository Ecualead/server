/**
 * @Author: Reinier Millo Sánchez
 * @Date:   2020-03-24T04:08:55-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: Objects.ts
 * @Last modified by:   Reinier Millo Sánchez
 * @Last modified time: 2020-03-24T04:09:28-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

 export class Objects {
   /**
    * Get an object value from the given path
    */
   public static get(obj: any, path?: string, value?: any): any {
     /* Check if the object is defined */
     if (!obj) {
       return value;
     }

     /* Check if the path is defined */
     if (!path) {
       return obj;
     }

     /* Get all path keys */
     const keys = path.split('.');
     let itr = 0;
     let tmp = obj;

     /* Iterate each path key */
     while (itr < keys.length) {
       tmp = tmp[keys[itr]];
       /* Check if the path don't exists */
       if (tmp === null || tmp === undefined) {
         return value;
       }
       itr++;
     }
     return tmp;
   }
 }

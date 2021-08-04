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
 * Utility class to handle object properties
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
    const keys = path.split(".");
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

  /**
   * Set an object value to the given path
   */
  public static set(obj: any, path: string, value?: any): void {
    /* Check if the object and path is defined */
    if (!obj || !path) {
      return;
    }

    /* Get all path keys */
    const keys = path.split(".");
    let itr = 0;
    let tmp = obj;

    /* Iterate each path key */
    while (itr < keys.length - 1) {
      /* Check if the path don't exists */
      if (tmp[keys[itr]] === null || tmp[keys[itr]] === undefined) {
        tmp[keys[itr]] = {};
      }

      tmp = tmp[keys[itr]];

      itr++;
    }
    tmp[keys[itr]] = value;
  }
}

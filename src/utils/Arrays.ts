/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-03-30T02:59:13-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: Arrays.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-03-30T03:11:34-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

export class Arrays {
  /**
   * Force an string value to be an array
   *
   * @param value  String value to be forced to array
   * @param defaults  List of defaults values that array must contain
   * @param prevent  List of elements that array can't contain
   */
  public static force(value: string | string[] | null, defaults?: string[], prevent?: string[]): string[] {
    let array: string[];
    if (!value) {
      array = [];
    }

    if (typeof value === 'string') {
      array = value.split(' ');
    } else {
      array = Array.from(value || []);
    }

    /* Add default values */
    if (defaults && defaults.length > 0) {
      defaults.forEach((tmp: string) => {
        if (array.indexOf(tmp) < 0) {
          array.push(tmp);
        }
      });
    }

    /* Handle if there is values to be excluded */
    if (prevent && prevent.length > 0) {
      array = array.filter(tmp => prevent.indexOf(tmp) < 0);
    }

    return array;
  }
}

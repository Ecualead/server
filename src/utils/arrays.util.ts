/**
 * Copyright (C) 2023 ECUALEAD
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */

/**
 * Utility class to handle specific operations on arrays
 */
export class Arrays {
  /**
   * Initialize and array with default values and values that can't be used
   */
  public static initialize<T>(value: T[] | null, defaults?: T[], prevent?: T[]): T[] {
    let array: T[];
    if (!value) {
      array = [];
    }

    /* Make a copy of the array */
    array = Array.from(value || []);

    /* Add default values */
    if (defaults && defaults.length > 0) {
      defaults.forEach((tmp: T) => {
        if (array.indexOf(tmp) < 0) {
          array.push(tmp);
        }
      });
    }

    /* Handle if there is values to be excluded */
    if (prevent && prevent.length > 0) {
      array = array.filter((tmp) => prevent.indexOf(tmp) < 0);
    }

    return array;
  }

  /**
   * Sort the given array
   */
  public static sort<T>(arr: T[]): T[] {
    return arr.sort((n1: T, n2: T): number => {
      if (n1 > n2) {
        return 1;
      }
      if (n1 < n2) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Binary search on the given array
   */
  public static search<T>(arr: T[], value: T): number {
    let start = 0,
      end: number = arr.length - 1;
    let mid: number;
    /* Iterate while start not meets end  */
    while (start <= end) {
      /* Find the mid index */
      mid = Math.floor((start + end) / 2);

      /* If element is present at mid */
      if (arr[mid] === value) {
        return mid;
      }

      /* Look in left or right half accordingly */
      if (arr[mid] < value) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    /* Element not found */
    return -1;
  }

  /**
   * Intersect all the array items
   */
  public static intersect<T>(...arr: T[][]): T[] {
    /* Sort all the results */
    for (let i = 0; i < arr.length; ++i) {
      Arrays.sort(arr[i]);
    }

    /* Intersect all the sorted arrays */
    return [...arr].reduce((a1: T[], a2: T[]): T[] =>
      a1.filter((value: T) => Arrays.search(a2, value) > -1)
    );
  }
}

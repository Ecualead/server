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
import shajs from "sha.js";
import uniqid from "uniqid";

/**
 * Utility class to generate random tokens
 */
export class Tokens {
  /**
   * Generate short (8 byte) pseudounique token based on current timestamp
   */
  public static get short(): string {
    return uniqid.time();
  }

  /**
   * Generate medium (12 bytes) pseudounique token based on current process id
   */
  public static get medium1(): string {
    return uniqid.process();
  }

  /**
   * Generate medium (18 bytes) pseudounique token based on timestamp, current process and mac address
   */
  public static get medium2(): string {
    return uniqid();
  }

  /**
   * Generate sha256 long token based on pseudounique value
   */
  public static get long(): string {
    return shajs("sha256").update(uniqid()).digest("hex");
  }
}

/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-03-30T02:59:33-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Core Microservice API
 * @Filename: Token.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-03-31T15:12:33-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import sha256 from 'sha256';
import uniqid from 'uniqid';

export class Token {
  public static get shortToken(): string {
    return uniqid.time();
  }

  public static get longToken(): string {
    return sha256(uniqid());
  }
}

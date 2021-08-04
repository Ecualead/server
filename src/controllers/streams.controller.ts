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
import through from "through";

export class Streams {
  public static stringify(filter?: (data: any) => any): through.ThroughStream {
    const op = "[";
    const sep = ",";
    const cl = "]";

    let first = true,
      anyData = false;
    const stream = through(
      (data: any): void => {
        anyData = true;
        const obj = filter ? filter(data) : data;
        const json = JSON.stringify(obj);

        if (first) {
          first = false;
          stream.queue(op + json);
        } else {
          stream.queue(sep + json);
        }
      },
      (): void => {
        if (!anyData) {
          stream.queue(op);
        }
        stream.queue(cl);
        stream.queue(null);
      }
    );

    return stream;
  }
}

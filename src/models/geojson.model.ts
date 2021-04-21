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
import { prop } from "@typegoose/typegoose";

export class GeoJSON {
  @prop({
    required: true,
    enum: ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]
  })
  type!: string;

  @prop({ required: true, type: Number })
  coordinates!: number[];
}

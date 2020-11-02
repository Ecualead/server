/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
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

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
import { prop } from "@typegoose/typegoose";

/**
 * GeoJSON data definition
 */
export class GeoJSON {
  @prop({
    required: true,
    enum: ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]
  })
  type!: string;

  @prop({ required: true, type: Number })
  coordinates!: number[];
}

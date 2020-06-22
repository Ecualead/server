import { prop, arrayProp } from '@typegoose/typegoose';

export class GeoJSON {
    @prop({ required: true, enum: ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'] })
    type!: string;

    @arrayProp({ items: Number })
    coordinates!: number[];
}

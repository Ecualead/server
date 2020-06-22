import { prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

export class BaseModel {
    @prop({ required: true })
    status!: number;

    @prop({ type: mongoose.Types.ObjectId, required: true })
    owner!: string;

    @prop()
    createdAt?: Date;

    @prop()
    updatedAt?: Date;

    @prop({ type: mongoose.Types.ObjectId, required: true })
    modifiedBy!: string;
}

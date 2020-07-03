import { prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BASE_STATUS } from "../types/status";

export class BaseModel {
  @prop({ required: true, default: BASE_STATUS.BS_ENABLED })
  status?: number;

  @prop({ type: mongoose.Types.ObjectId })
  owner?: string;

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  @prop({ type: mongoose.Types.ObjectId })
  modifiedBy?: string;
}

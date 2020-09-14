/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 */
import { SERVER_STATUS } from "@ikoabo/core";
import { prop, defaultClasses } from "@typegoose/typegoose";
import mongoose from "mongoose";

export class BaseModel extends defaultClasses.Base implements defaultClasses.TimeStamps {
  @prop({ required: true, default: SERVER_STATUS.ENABLED })
  status?: number;

  @prop({ type: mongoose.Types.ObjectId })
  owner?: mongoose.Types.ObjectId | string;

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  @prop({ type: mongoose.Types.ObjectId })
  modifiedBy?: string;
}

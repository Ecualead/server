/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { SERVER_STATUS } from "@ikoabo/core"

export class BaseModel {
  @prop({ required: true, default: SERVER_STATUS.ENABLED })
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

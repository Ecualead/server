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
import { SERVER_STATUS } from "@ikoabo/core";
import { prop, defaultClasses } from "@typegoose/typegoose";
import { Types } from "mongoose";

/**
 * Base data model definition
 *
 * Common used data fields on CRUDs models
 */
export class BaseModel
  extends defaultClasses.Base<Types.ObjectId>
  implements defaultClasses.TimeStamps
{
  @prop({ required: true, default: SERVER_STATUS.ENABLED })
  status?: number;

  @prop({ type: Types.ObjectId })
  owner?: Types.ObjectId | string;

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  @prop({ type: Types.ObjectId })
  modifiedBy?: Types.ObjectId | string;
}

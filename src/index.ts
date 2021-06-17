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

import { setGlobalOptions, Severity } from "@typegoose/typegoose";

/* Allow to use Mixed types */
setGlobalOptions({ options: { allowMixed: Severity.ALLOW } });

/* Export api controllers */
export { ClusterServer, IMasterHooks, ISlaveHooks } from "./controllers/cluster.controller";
export { HttpServer } from "./controllers/server.controller";
export { CRUD } from "./controllers/crud.controller";
export { ErrorCtrl } from "./controllers/error.controller";

/* Export models */
export { BaseModel } from "./models/base.model";
export { GeoJSON } from "./models/geojson.model";

/* Export middlewares */
export { ResponseHandler } from "./middlewares/response.middleware";
export { Joi, Validator, ValidateObjectId } from "./middlewares/validator.middleware";

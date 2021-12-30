/**
 * Copyright (C) 2020 - 2022 ECUALEAD
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { setGlobalOptions, Severity } from "@typegoose/typegoose";

/* Allow to use Mixed types */
setGlobalOptions({ options: { allowMixed: Severity.ALLOW } });

/* Export constants */
export { SERVER_ERRORS } from "./constants/errors.enum";
export { SERVER_STATUS } from "./constants/status.enum";
export { HTTP_STATUS } from "./constants/http.status.enum";
export { LOG_LEVEL } from "./constants/logger.enum";

/* Export api controllers */
export { ClusterServer, IMasterHooks, ISlaveHooks } from "./controllers/cluster.controller";
export { HttpServer } from "./controllers/server.controller";
export { CRUD } from "./controllers/crud.controller";
export { ErrorCtrl } from "./controllers/error.controller";
export { Logger } from "./controllers/logger.controller";
export { Streams } from "./controllers/streams.controller";

/* Export models */
export { BaseModel } from "./models/base.model";
export { GeoJSON } from "./models/geojson.model";

/* Export middlewares */
export { ResponseHandler } from "./middlewares/response.middleware";
export { Joi, Validator, ValidateObjectId } from "./middlewares/validator.middleware";

/* Export utils */
export { Arrays } from "./utils/arrays.util";
export { Objects } from "./utils/objects.util";
export { Tokens } from "./utils/tokens.util";

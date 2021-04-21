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
import { Router, Request, Response, NextFunction } from "express";
import appRoot from "app-root-path";
import { ResponseHandler } from "./response.middleware";

const packageFile = require(`${appRoot.path}/package.json`);
const router = Router();

router.get(
  "/",
  (_req: Request, res: Response, next: NextFunction) => {
    /* Create the new domain */
    res.locals["response"] = {
      name: packageFile.name,
      description: packageFile.description,
      version: packageFile.version
    };
    next();
  },
  ResponseHandler.success,
  ResponseHandler.error
);

export default router;

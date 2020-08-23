/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 */
import { Server, createServer } from "http";
import { HTTP_STATUS, SERVER_ERRORS, Logger } from "@ikoabo/core";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import Helmet from "helmet";
import methodOverride from "method-override";
import moment from "moment";
import mongoose from "mongoose";
import logger from "morgan";
import onFinished from "on-finished";
import VersionRouter from "../middlewares/version.middleware";

/**
 * Standar Express Http Server handler
 */
export class HttpServer {
  private static _instance: HttpServer;
  private _app: express.Application;
  private _http: Server;
  private _logger: Logger;
  private _worker: any;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {
    this._logger = new Logger("HttpServer");
  }

  /**
   * Return the singleton server instance
   */
  public static get shared(): HttpServer {
    if (!HttpServer._instance) {
      HttpServer._instance = new HttpServer();
    }
    return HttpServer._instance;
  }

  /**
   * Return the cluster worker id
   */
  public get worker(): number {
    return this._worker ? this._worker.id : 0;
  }

  /**
   * Initialize the MongoDB connection
   */
  public initMongo(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      /* Check if mongodb uri is set or not */
      if (!process.env.MONGODB_URI) {
        this._logger.warn("No database configuration found. Skip database connection.", { worker: this.worker });
        return resolve();
      }

      /* Connect to the MongoDB server */
      mongoose.set("useFindAndModify", false);
      mongoose.set("useCreateIndex", process.env.MONGODB_NOT_USE_CREATE_INDEX !== "true");
      mongoose
        .connect(process.env.MONGODB_URI, {
          useNewUrlParser: process.env.MONGODB_NOT_USE_NEW_URL_PARSER !== "true",
          useCreateIndex: process.env.MONGODB_NOT_USE_CREATE_INDEX !== "true",
          autoIndex: process.env.MONGODB_NOT_AUTO_INDEX !== "true",
          poolSize: parseInt(process.env.MONGODB_POOL_SIZE || "10"),
          useUnifiedTopology: process.env.MONGODB_NOT_USE_UNIFIED_TOPOLOGY !== "true"
        })
        .then(() => {
          this._logger.info("Connected to MongoDB", { worker: this.worker });
          resolve();
        });

      /* Listen for MongoDB error connection */
      mongoose.connection.on("error", (err: any) => {
        this._logger.error("MongoDB cannot establish the connection", err);
        reject(err);
      });
    });
  }

  /**
   * Initialize the Express application server
   *
   * @param worker  Cluster worker instance
   * @param routes  Initial Express routes
   */
  public initExpress(worker?: any, routes?: any): Promise<void> {
    return new Promise<void>((resolve) => {
      this._worker = worker;
      this._app = express();
      this._http = createServer(this._app);

      /* Check for más body size */
      let options: any = {};
      if (process.env.HTTP_BODY_SIZE) {
        options['limit'] = process.env.HTTP_BODY_SIZE;
      }

      /* Enable JSON parser */
      this._app.use(express.json(options));

      /* Enable URL encoded parser */
      options['extended'] = true;
      this._app.use(express.urlencoded(options));

      /* Check to enable method override */
      if (process.env.HTTP_NOT_METHOD_OVERRIDE !== "true") {
        this._app.use(methodOverride("X-HTTP-Method")); // Microsoft
        this._app.use(methodOverride("X-HTTP-Method-Override")); // Google/GData
        this._app.use(methodOverride("X-Method-Override")); // IBM
      }

      /* Check to enable CORS */
      if (process.env.HTT_NOT_CORS !== "true") {
        this._app.use(cors());
      }

      /**
       * Security mechanism
       */
      this._app.use(Helmet.xssFilter());
      this._app.disable("x-powered-by");
      this._app.use(Helmet.hidePoweredBy());
      this._app.use(Helmet.frameguard({ action: "deny" }));
      this._app.use(Helmet.noSniff());
      this._app.use(Helmet.referrerPolicy());
      this._app.use(Helmet.ieNoOpen());
      this._app.use(
        Helmet.hsts({
          maxAge: 5184000
        })
      );

      /* Set trust proxy */
      this._app.set("trust proxy", process.env.HTTP_NOT_TRUST_PROXY !== "true");

      /* Express configuration */
      this._app.set("interface", process.env.INTERFACE || "127.0.0.1");
      this._app.set("port", process.env.PORT || '3000');
      this._app.set("env", process.env.NODE_ENV || 'dev');

      /* Increment debug output on offline development platforms */
      if (process.env.NODE_ENV !== "production") {
        this._app.use(logger("dev"));
        this._app.all("/*", (req: Request, res: Response, next: NextFunction) => {
          onFinished(res, (err: any, resp: any) => {
            const requestTrace: any = {
              stamp: moment.utc().toDate().getTime(),
              err: err,
              req: {
                method: req.method,
                url: req.originalUrl,
                body: req.body,
                headers: req.headers
              },
              res: {
                status: resp.statusCode,
                message: resp.statusMessage,
                locals: resp.locals
              },
              worker: this.worker
            };
            this._logger.debug(" Request trace", requestTrace);
          });
          next();
        });
      } else {
        this._app.use(logger("tiny"));
      }

      /* Check to retrieve the real IP address of the request */
      this._app.use((req: any, res: Response, next: NextFunction) => {
        /* Look for request IP address */
        res.locals["ipAddr"] =
          req.headers["x-caller-ip"] ||
          req.headers["x-forwarded-for"] ||
          req.ips[0] ||
          req.connection.remoteAddress;
        next();
      });

      /* Register default version route */
      this._app.use("/version", VersionRouter);

      /* Register the Express routes */
      this._registerRoutes(routes);
      resolve();
    });
  }

  /**
   * Retrieve the current express application
   */
  public get app(): express.Application {
    return this._app;
  }

  /**
   * Add new middleware to the Express application
   *
   * @param middleware  Express middleware to be registered
   * @param route  Router or array of routers to handle the given middleware
   */
  public use(middleware: any, route?: any) {
    if (!route) {
      this._app.use(middleware);
    } else {
      this._app.use(middleware, route);
    }
  }

  /**
   * Start listening on the HTTP server
   */
  public listen(port?: number): Promise<Server> {
    return new Promise<Server>((resolve) => {
      const server: Server = this._http.listen(
        port === null ? this._app.get("port") : port,
        this._app.get("interface"),
        () => {
          const meta: any = {
            interface: this._app.get("interface"),
            port: this._app.get("port"),
            env: this._app.get("env"),
            pid: process.pid,
            worker: this.worker
          };

          this._logger.info("Service instance is running", meta);
          resolve(server);
        }
      );
    });
  }

  /**
   * Register Express initial routes
   *
   * @param routes  Routes to be added to Express
   */
  private _registerRoutes(routes?: any) {
    /* Check if default routes must be set */
    if (routes) {
      const keys = Object.keys(routes);
      keys.forEach((key) => {
        /* Check if the route is an array of routers or not */
        if (Array.isArray(routes[key])) {
          routes[key].forEach((value: any) => {
            this.use(key, value);
          });
        } else {
          this.use(key, routes[key]);
        }
      });
    }

    /* Other routes give 404 error */
    this._app.use(function (_req, res, _next) {
      res
        .status(HTTP_STATUS.HTTP_4XX_NOT_FOUND)
        .json({ error: SERVER_ERRORS.INVALID_OPERATION })
        .end();
    });
  }
}

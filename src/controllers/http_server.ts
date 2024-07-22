/**
 * Copyright (C) 2020-2024 ECUALEAD LLC
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Server Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { Server, createServer } from "http";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import Helmet from "helmet";
import methodOverride from "method-override";
import logger from "morgan";
import onFinished from "on-finished";
import { ResponseHandler } from "../middlewares/response";
import { Logger } from "./logger";

/**
 * Standar Express Http Server handler
 */
export class HttpServer {
  private static instance: HttpServer;
  private appObj: express.Application;
  private httpObj: Server;
  private loggerObj: Logger;
  private workerObj: any;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {
    this.loggerObj = new Logger("HttpServer");
  }

  /**
   * Return the singleton server instance
   */
  public static get shared(): HttpServer {
    if (!HttpServer.instance) {
      HttpServer.instance = new HttpServer();
    }
    return HttpServer.instance;
  }

  /**
   * Return the cluster worker id
   */
  public get worker(): number {
    return this.workerObj ? this.workerObj.id : 0;
  }

  /**
   * Return the express application instance
   */
  public get app(): express.Application {
    return this.appObj;
  }

  /**
   * Return the http server instance
   */
  public get http(): Server {
    return this.httpObj;
  }

  /**
   * Return the logger instance
   */
  public get logger(): Logger {
    return this.loggerObj;
  }

  /**
   * Initialize the Express application server
   *
   * @param worker  Cluster worker instance
   * @param routes  Initial Express routes
   */
  public async initHttpServer(worker?: any, preRoutes?: any, routes?: any): Promise<void> {
    this.workerObj = worker;
    this.appObj = express();
    this.httpObj = createServer(this.appObj);

    /* Check for más body size */
    const options: any = {
      verify: (req: any, res: any, buf: any) => {
        req.rawBody = buf;
      }
    };
    if (process.env.HTTP_BODY_SIZE) {
      options.limit = process.env.HTTP_BODY_SIZE;
    }

    /* Enable JSON parser */
    this.appObj.use(express.json(options));

    /* Enable URL encoded parser */
    options["extended"] = true;
    this.appObj.use(express.urlencoded(options));

    /* Check to enable method override */
    if (process.env.HTTP_NOT_METHOD_OVERRIDE !== "true") {
      this.appObj.use(methodOverride("X-HTTP-Method")); // Microsoft
      this.appObj.use(methodOverride("X-HTTP-Method-Override")); // Google/GData
      this.appObj.use(methodOverride("X-Method-Override")); // IBM
    }

    /* Check to enable CORS */
    if (process.env.HTT_NOT_CORS !== "true") {
      this.appObj.use(cors());
    }

    /**
     * Security mechanism
     */
    this.appObj.disable("x-powered-by");
    this.appObj.use(Helmet.contentSecurityPolicy());
    this.appObj.use(Helmet.dnsPrefetchControl());
    this.appObj.use(Helmet.frameguard({ action: "deny" }));
    this.appObj.use(Helmet.hidePoweredBy());
    this.appObj.use(
      Helmet.hsts({
        maxAge: 5184000
      })
    );
    this.appObj.use(Helmet.ieNoOpen());
    this.appObj.use(Helmet.noSniff());
    this.appObj.use(Helmet.permittedCrossDomainPolicies());
    this.appObj.use(Helmet.referrerPolicy());
    this.appObj.use(Helmet.xssFilter());



    /* Set trust proxy */
    this.appObj.set("trust proxy", process.env.HTTP_NOT_TRUST_PROXY !== "true");

    /* Express configuration */
    this.appObj.set("interface", process.env.INTERFACE || "127.0.0.1");
    this.appObj.set("port", process.env.PORT || "3000");
    this.appObj.set("env", process.env.NODE_ENV || "dev");

    /* Increment debug output on offline development platforms */
    if (process.env.NODE_ENV !== "production") {
      this.appObj.use(logger("dev"));
      this.appObj.all("/*", (req: Request, res: Response, next: NextFunction) => {
        onFinished(res, (err: any, resp: any) => {
          const request: any = {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers
          };

          const response: any = {
            status: resp.statusCode,
            message: resp.statusMessage
          };

          /* Check if request body musy be traced */
          if (process.env.BODY_TRACE) {
            request["body"] = req.body;
          }

          /* Check if the response body must be traced */
          if (process.env.RESPONSE_TRACE) {
            response["body"] = resp.locals;
          }

          const requestTrace: any = {
            stamp: new Date(),
            err: err,
            req: request,
            res: response,
            worker: this.worker
          };
          this.loggerObj.debug(" Request trace", requestTrace);
        });
        next();
      });
    } else {
      this.appObj.use(logger("tiny"));
    }

    /* Check to retrieve the real IP address of the request */
    this.appObj.use((req: any, res: Response, next: NextFunction) => {
      /* Look for request IP address */
      res.locals["ipAddr"] =
        req.headers["x-caller-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.ips[0] ||
        req.connection.remoteAddress;
      next();
    });

    /* Register default version route */
    this.appObj.use("/health", (_req: Request, res: Response) => {
      res
        .json({
          version: process.env.npm_package_version,
          hash: process.env.GIT_HASH || 'Autogenerated value',
        })
        .end();
    });

    if (preRoutes) {
      await preRoutes(this.appObj);
    }

    /* Register the Express routes */
    this.registerRoutes(routes);
  }

  /**
   * Start listening on the HTTP server
   */
  public startListen(): Promise<Server> {
    /* Register response handlers */
    this.appObj.use(ResponseHandler.success);
    this.appObj.use(ResponseHandler.error);

    return new Promise<Server>((resolve) => {
      const server: Server = this.appObj.listen(this.appObj.get("port"), this.appObj.get("interface"),
        () => {
          const meta: any = {
            interface: this.appObj.get("interface"),
            port: this.appObj.get("port"),
            env: this.appObj.get("env"),
            pid: process.pid,
            worker: this.worker
          };

          this.loggerObj.info("Service instance is running", meta);
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
  private registerRoutes(routes?: any) {
    /* Check if default routes must be set */
    if (routes) {
      const keys = Object.keys(routes);
      keys.forEach((key) => {
        /* Check if the route is an array of routers or not */
        if (Array.isArray(routes[key])) {
          routes[key].forEach((value: any) => {
            this.app.use(key, value);
          });
        } else {
          this.app.use(key, routes[key]);
        }
      });
    }
  }
}

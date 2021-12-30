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
import cluster from "cluster";
import { Logger } from "./logger.controller";
import express from "express";
import { HttpServer } from "./server.controller";
import { LOG_LEVEL } from "../constants/logger.enum";

/* Initialize the logger */
Logger.setLogLevel(process.env.LOG || LOG_LEVEL.ERROR);

/**
 * Slave process hooks to trigger during server initialization
 */
export interface ISlaveHooks {
  preMongo?: () => Promise<void>;
  postMongo?: () => Promise<void>;
  preExpress?: () => Promise<void>;
  preRoutes?: (app: express.Application) => Promise<void>;
  postExpress?: (app: express.Application) => Promise<void>;
  running?: () => Promise<void>;
}

/**
 * Master process hooks to trigger during server initialization
 */
export interface IMasterHooks {
  worker?: (worker: any) => Promise<void>;
}

/**
 * Standar cluster class to initialize the service as cluster
 */
export class ClusterServer {
  private static _instance: ClusterServer;
  private _logger: Logger;
  private _slaveHooks: ISlaveHooks;
  private _masterHooks: IMasterHooks;

  private constructor() {
    this._logger = new Logger("ClusterServer");
  }

  /**
   * Initialize the server cluster
   */
  public static setup(slaveHooks?: ISlaveHooks, masterHooks?: IMasterHooks): ClusterServer {
    if (ClusterServer._instance) {
      throw new Error("Cluster server its initialized");
    }

    /* Initialize the singleton class instance */
    ClusterServer._instance = new ClusterServer();
    ClusterServer._instance._slaveHooks = slaveHooks ? slaveHooks : {};
    ClusterServer._instance._masterHooks = masterHooks ? masterHooks : {};

    return ClusterServer._instance;
  }

  /**
   * Return the cluster import
   */
  public static get cluster() {
    return cluster;
  }

  /**
   * Run the server cluster
   */
  public run(
    routes?: any,
    customMaster?: () => Promise<void>,
    customSlave?: (server: HttpServer, routes?: any) => Promise<void>
  ): Promise<void> {
    /* Handle the custer master process */
    if (cluster.isPrimary) {
      /* Check if master process has custom handler */
      if (customMaster) {
        return customMaster();
      } else {
        return this._runMaster();
      }
    } else {
      /* Initialize the Http Server */
      const server = HttpServer.shared;

      /* Check if slave process has custom handler */
      if (customSlave) {
        return customSlave(server, routes);
      } else {
        return this._runSlave(server, routes);
      }
    }
  }

  /**
   * Run the default cluster master process
   */
  private _runMaster(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._logger.info("Cluster master process is running", { pid: process.pid });

      /* Initialize the number of required workers */
      const instances = parseInt(process.env.INSTANCES || "1");
      for (let i = 0; i < instances; i++) {
        const worker = cluster.fork();
        if (this._masterHooks.worker) {
          this._masterHooks.worker(worker);
        }
      }

      /* Handle cluster worker restart on exit */
      cluster.on("exit", (worker, code, signal) => {
        this._logger.error("Cluster worker died", {
          pid: process.pid,
          worker: worker.id,
          code: code,
          signal: signal
        });
        const newWorker = cluster.fork();
        if (this._masterHooks.worker) {
          this._masterHooks.worker(newWorker);
        }
      });
      resolve();
    });
  }

  /**
   * Run the default cluster slave process
   */
  private _runSlave(server: HttpServer, routes?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /* Initialize MongoDB connection */
      this._slavePreMongo()
        .then(() => {
          this._slaveMongo(server)
            .then(() => {
              this._slavePostMongo()
                .then(() => {
                  /* Initialize Express application */
                  this._slavePreExpress()
                    .then(() => {
                      this._slaveExpress(server, routes)
                        .then(() => {
                          this._slavePostExpress(server)
                            .then(() => {
                              /* Start the slave worker HTTP server */
                              server
                                .listen(parseInt(process.env.PORT || "3000"))
                                .then(() => {
                                  if (this._slaveHooks.running) {
                                    this._slaveHooks.running();
                                  }
                                  resolve();
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /**
   * Hook called before initialize the MongoDB connection
   */
  private _slavePreMongo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._slaveHooks.preMongo) {
        this._slaveHooks
          .preMongo()
          .then(resolve)
          .catch((err: any) => {
            this._logger.error("Invalid pre mongoose hook", err);
            reject(err);
          });
        return;
      }
      resolve();
    });
  }

  /**
   * Initialize MongoDB connection
   */
  private _slaveMongo(server: HttpServer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /* Initialize MongoDB */
      server.initMongo().then(resolve).catch(reject);
    });
  }

  /**
   * Hook called after initialize the MongoDB connection
   */
  private _slavePostMongo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._slaveHooks.postMongo) {
        this._slaveHooks
          .postMongo()
          .then(resolve)
          .catch((err: any) => {
            this._logger.error("Invalid post mongoose hook", err);
            reject(err);
          });
        return;
      }
      resolve();
    });
  }

  /**
   * Hook called before initialize the Express server
   */
  private _slavePreExpress(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._slaveHooks.preExpress) {
        this._slaveHooks
          .preExpress()
          .then(resolve)
          .catch((err: any) => {
            this._logger.error("Invalid pre express hook", err);
            reject(err);
          });
        return;
      }
      resolve();
    });
  }

  /**
   * Initialize the Express server
   */
  private _slaveExpress(server: HttpServer, routes?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /* Initialize Express */
      server
        .initExpress(cluster.worker, this._slaveHooks.preRoutes, routes)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Hook called after initialize the Express server
   */
  private _slavePostExpress(server: HttpServer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._slaveHooks.postExpress) {
        this._slaveHooks
          .postExpress(server.app)
          .then(resolve)
          .catch((err: any) => {
            this._logger.error("Invalid post express hook", err);
            reject(err);
          });
        return;
      }
      resolve();
    });
  }
}

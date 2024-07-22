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
import cluster from "cluster";
import { Logger } from "./logger";
import express from "express";
import { HttpServer } from "./http_server";
import { LOG_LEVEL } from "../constants/logger";

/* Initialize the logger */
Logger.setLogLevel(process.env.LOG || LOG_LEVEL.ERROR);

/**
 * Slave process hooks to trigger during server initialization
 */
export interface ISlaveHooks {
  onBeforeLoadServer?: () => Promise<void>;
  onBeforeLoadRoutes?: (app: express.Application) => Promise<void>;
  onAfterLoadServer?: (app: express.Application) => Promise<void>;
  onAfterListen?: () => Promise<void>;
}

/**
 * Master process hooks to trigger during server initialization
 */
export interface IMasterHooks {
  onRunWorker?: (worker: any) => Promise<void>;
}

/**
 * Standar cluster class to initialize the service as cluster
 */
export class ClusterServer {
  private static instance: ClusterServer;
  private loggerObj: Logger;
  private slaveHooks: ISlaveHooks;
  private masterHooks: IMasterHooks;

  private constructor() {
    this.loggerObj = new Logger("ClusterServer");
  }

  /**
   * Initialize the server cluster
   */
  public static setup(slaveHooks?: ISlaveHooks, masterHooks?: IMasterHooks): ClusterServer {
    if (ClusterServer.instance) {
      throw new Error("Cluster server its initialized");
    }

    /* Initialize the singleton class instance */
    ClusterServer.instance = new ClusterServer();
    ClusterServer.instance.slaveHooks = slaveHooks ? slaveHooks : {};
    ClusterServer.instance.masterHooks = masterHooks ? masterHooks : {};

    return ClusterServer.instance;
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
    customMaster?: (instances: number) => Promise<void>,
    customSlave?: (server: HttpServer, routes?: any) => Promise<void>
  ): Promise<void> {
    const instances = parseInt(process.env.INSTANCES || "1");

    /* Handle the custer master process */
    if (instances > 1 && cluster.isPrimary) {
      /* Check if master process has custom handler */
      if (customMaster) {
        return customMaster(instances);
      } else {
        return this.runMaster(instances);
      }
    } else {
      /* Initialize the Http Server */
      const server = HttpServer.shared;

      /* Check if slave process has custom handler */
      if (customSlave) {
        return customSlave(server, routes);
      } else {
        return this.runSlave(server, routes);
      }
    }
  }

  /**
   * Run the default cluster master process
   */
  private runMaster(instances: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.loggerObj.info("Cluster master process is running", { pid: process.pid });

      /* Initialize the number of required workers */
      for (let i = 0; i < instances; i++) {
        const worker = cluster.fork();
        if (this.masterHooks.onRunWorker) {
          this.masterHooks.onRunWorker(worker);
        }
      }

      /* Handle cluster worker restart on exit */
      cluster.on("exit", (worker, code, signal) => {
        this.loggerObj.error("Cluster worker died", {
          pid: process.pid,
          worker: worker.id,
          code: code,
          signal: signal
        });
        const newWorker = cluster.fork();
        if (this.masterHooks.onRunWorker) {
          this.masterHooks.onRunWorker(newWorker);
        }
      });
      resolve();
    });
  }

  /**
   * Run the default cluster slave process
   */
  private async runSlave(server: HttpServer, routes?: any): Promise<void> {
    /* Initialize Express application */
    if (this.slaveHooks.onBeforeLoadServer) {
      await this.slaveHooks.onBeforeLoadServer();
    }
    await server.initHttpServer(cluster.worker, this.slaveHooks.onBeforeLoadRoutes, routes)
    if (this.slaveHooks.onAfterLoadServer) {
      await this.slaveHooks.onAfterLoadServer(server.app);
    }

    /* Start the slave worker HTTP server */
    await server.startListen();
    if (this.slaveHooks.onAfterListen) {
      this.slaveHooks.onAfterListen();
    }
  }
}

/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-03-25T03:45:18-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: ProjectName
 * @Filename: ClusterServer.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-05T22:49:40-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import cluster from 'cluster';
import express from 'express';
import { HttpServer } from '@/api/HttpServer';
import { ISettings } from '@/api/ISettings';
import { Logger, LOG_LEVEL } from '@/api/Logger';

export interface IHooks {
  preMongo?: () => Promise<void>;
  postMongo?: () => Promise<void>;
  preExpress?: () => Promise<void>;
  postExpress?: (app: express.Application) => Promise<void>;
}

/**
 * Standar cluster class to initialize the service as cluster
 */
export class ClusterServer {
  private static _instance: ClusterServer;
  private _settings: ISettings;
  private _logger: Logger;
  private _slaveHooks: IHooks;

  private constructor() {
    this._logger = new Logger('ClusterServer');
  }

  /**
   * Initialize the server cluster
   *
   * @param settings  Service settings
   */
  public static setup(settings: ISettings, hooks?: IHooks): ClusterServer {
    if (ClusterServer._instance) {
      throw new Error('Cluster server its initialized');
    }

    /* Initialize the logger */
    Logger.setLogLevel(settings.SERVICE.LOG || LOG_LEVEL.ERROR);

    /* Initialize the singleton class instance */
    ClusterServer._instance = new ClusterServer();
    ClusterServer._instance._settings = settings;
    ClusterServer._instance._slaveHooks = hooks ? hooks : {};

    return ClusterServer._instance;
  }

  /**
   * Run the server cluster
   *
   * @param routes  Routes to initialize the application server
   * @param customMaster  Custom cluster master process handler
   * @param customSlave  Custom cluster slave process handler
   */
  public run(routes?: any, customMaster?: () => void, customSlave?: (server: HttpServer, routes?: any) => void) {
    /* Initialize the Http Server */
    const server = HttpServer.setup(this._settings);

    /* Handle the custer master process */
    if (cluster.isMaster) {
      /* Check if master process has custom handler */
      if (customMaster) {
        customMaster();
      } else {
        this._runMaster();
      }
    } else {
      /* Check if slave process has custom handler */
      if (customSlave) {
        customSlave(server, routes);
      } else {
        this._runSlave(server, routes);
      }
    }
  }

  /**
   * Run the default cluster master process
   */
  private _runMaster() {
    this._logger.info('Cluster master process is running', { pid: process.pid });

    /* Initialize the number of required workers */
    const instances = this._settings.SERVICE.INSTANCES;
    for (let i = 0; i < instances; i++) {
      cluster.fork();
    }

    /* Hanlde cluster worker restart on exit */
    cluster.on('exit', (worker, code, signal) => {
      this._logger.error('Cluster worker died', { pid: process.pid, worker: worker.id, code: code, signal: signal });
      cluster.fork();
    });
  }

  /**
   * Run the default cluster slave process
   *
   * @param server  HttpServer instance
   * @param routes  Routes to initialize the application server
   */
  private _runSlave(server: HttpServer, routes?: any): Promise<void> {
    return new Promise<void>((resolve) => {
      /* Initialize MongoDB connection */
      this._slavePreMongo().then(() => {
        this._slaveMongo(server).then(() => {
          this._slavePostMongo().then(() => {
            /* Initialize Express application */
            this._slavePreExpress().then(() => {
              this._slaveExpress(server, routes).then(() => {
                this._slavePostExpress(server).then(() => {
                  /* Start the slave worker HTTP server */
                  server.listen().then(resolve);
                });
              });
            });
          });
        });
      });
    });
  }

  /**
   * Hook called before initialize the MongoDB connection
   */
  private _slavePreMongo(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._slaveHooks.preMongo) {
        this._slaveHooks.preMongo()
          .then(resolve).catch((err: any) => {
            this._logger.error('Invalid pre mongoose hook', err);
            resolve();
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
    return new Promise<void>((resolve) => {
      /* Initialize MongoDB */
      server.initMongo().then(resolve);
    });
  }

  /**
   * Hook called after initialize the MongoDB connection
   */
  private _slavePostMongo(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._slaveHooks.postMongo) {
        this._slaveHooks.postMongo()
          .then(resolve).catch((err: any) => {
            this._logger.error('Invalid post mongoose hook', err);
            resolve();
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
    return new Promise<void>((resolve) => {
      if (this._slaveHooks.preExpress) {
        this._slaveHooks.preExpress()
          .then(resolve).catch((err: any) => {
            this._logger.error('Invalid pre express hook', err);
            resolve();
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
    return new Promise<void>((resolve) => {
      /* Initialize Express */
      server.initExpress(cluster.worker, routes).then(resolve);
    });
  }

  /**
   * Hook called after initialize the Express server
   */
  private _slavePostExpress(server: HttpServer): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._slaveHooks.postExpress) {
        this._slaveHooks.postExpress(server.app)
          .then(resolve).catch((err: any) => {
            this._logger.error('Invalid post express hook', err);
            resolve();
          });
        return;
      }
      resolve();
    });
  }
}

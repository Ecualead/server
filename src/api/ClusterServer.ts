/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-03-25T03:45:18-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: ProjectName
 * @Filename: ClusterServer.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-03-25T04:20:50-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import cluster from 'cluster';
import { HttpServer } from './HttpServer';
import { ISettings } from './ISettings';
import { Logger, LOG_LEVEL } from './Logger';

/**
 * Standar cluster class to initialize the service as cluster
 */
export class ClusterServer {
  private static _instance: ClusterServer;
  private _settings: ISettings;
  private _logger: Logger;

  private constructor() {
    this._logger = new Logger('ClusterServer');
  }

  /**
   * Initialize the server cluster
   *
   * @param settings  Service settings
   */
  public static setup(settings: ISettings): ClusterServer {
    if (ClusterServer._instance) {
      throw new Error('Cluster server its initialized');
    }

    /* Initialize the singleton class instance */
    ClusterServer._instance = new ClusterServer();
    ClusterServer._instance._settings = settings;

    /* Initialize the logger */
    Logger.setLogLevel(settings.SERVICE.LOG || LOG_LEVEL.ERROR);
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
  private _runSlave(server: HttpServer, routes?: any) {
    /* Initialize MongoDB */
    server.initMongo();
    /* Initialize Express application */
    server.initExpress(cluster.worker, routes);
    /* Start the slave worker HTTP server */
    server.listen();
  }
}

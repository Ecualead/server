# IKOA Business Opportunity Server API

Utility functions for basic development. This library is part of IKOA Business Opportunity Microservices Infraestructure.

[![Version npm](https://img.shields.io/npm/v/@ikoabo/server.svg?style=flat-square)](https://www.npmjs.com/package/@ikoabo/server)[![npm Downloads](https://img.shields.io/npm/dm/@ikoabo/server.svg?style=flat-square)](https://npmcharts.com/compare/@ikoabo/server?minimal=true)[![Build Status](https://gitlab.com/ikoabo/packages/server/badges/master/pipeline.svg)](https://gitlab.com/ikoabo/packages/server)[![coverage testing report](https://gitlab.com/ikoabo/packages/server/badges/master/coverage.svg)](https://gitlab.com/ikoabo/packages/server/-/commits/master)

[![NPM](https://nodei.co/npm/@ikoabo/server.png?downloads=true&downloadRank=true)](https://nodei.co/npm/@ikoabo/server/)

## Installation

```bash
npm install @ikoabo/server
```

## Environment variables

To run a microservice using `@ikoabo/server` there are some environment variables that can be configured to initialize the server. Environment variables are separated into three groups.

### Service variables

- `INTERFACE`: Set the service listening interface, by default `127.0.0.1` if the variable is omitted.
- `PORT`: Set the service listening port, by default `3000` if the variable is omitted.
- `NODE_ENV`: NodeJS running environment, used to additional logger on request. Set to `production` to disable extended logger. Any other value is considered as `development`.
- `INSTANCES`: Number of instances to run inside the cluster of process, by default `1` if the variable is omitted.
- `LOG`: Components log level, it use the `Logger` wrapper off `@ikoabo/core`. By default `error` if the variable is omitted.
- `BODY_TRACE`: Set if the request body must be debbuged in development mode.
- `RESPONSE_TRACE`: Set if the response body must be debbuged in development mode.

### Database environment variables

- `MONGODB_URI`: MongoDB database URI connection. If the variable is omitted the database connection is omitted.
- `MONGODB_NOT_USE_CREATE_INDEX`: If it's `true` prevent Mongoose connection use the `useCreateIndex` initialization option. Any value different of `true` is considered as false.
- `MONGODB_NOT_USE_NEW_URL_PARSER`: If it's `true` prevent Mongoose connection use the `useNewUrlParser` initialization option. Any value different of `true` is considered as false.
- `MONGODB_NOT_AUTO_INDEX`: If it's `true` prevent Mongoose connection use the `autoIndex` initialization option. Any value different of `true` is considered as false.
- `MONGODB_NOT_USE_UNIFIED_TOPOLOGY`: If it's `true` prevent Mongoose connection use the `useUnifiedTopology` initialization option. Any value different of `true` is considered as false.
- `MONGODB_POOL_SIZE`: Set the Mongoose pool size, by default `10` if the variable is omitted.

### HTTP server environment variables

- `HTTP_BODY_SIZE`: Set the maximum request body size, by default it use the configured value in `express`.
- `HTTP_NOT_METHOD_OVERRIDE`: If it's `true` prevent Express to configure HTTP verbs such as PUT or DELETE in places where the client doesn't support it. Any value different of `true` is considered as false.
- `HTT_NOT_CORS`: If it's `true` prevent Express allowing CORS access. Any value different of `true` is considered as false. In this service implementation CORS is allowed for all origins. If you need a more specific configuration, then global CORS must be disabled and enabled manually in the required points.
- `HTTP_NOT_TRUST_PROXY`: If it's `true` prevent Express set the `trust proxy` configuration. Any value different of `true` is considered as false.

## Writting my first server

To start your first server only needs develop the routes to be called, for example:

```js
import { Router, Request, Response, NextFunction } from "express";
const router = Router();

router.get("/hello", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World");
  res.end();
});

export default router;
```

### Write small cluster server

A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, the user will sometimes want to launch a cluster of Node.js processes to handle the load. This advantage can be also achieved using external web server using load balance between several instances of your NodeJS server, but this instances must runs at different ports.

To start an small server with with several worker processes we use:

```js
import { ClusterServer } from "@ikoabo/server";
import MyRouter1 from "./routes1";
import MyRouter2 from "./routes2";
import MyRouter3 from "./routes3";

/* Initialize cluster server */
const clusterServer = ClusterServer.setup();

/* Run cluster with routes */
clusterServer.run({
  "/api/v1/greetings": MyRouter1,
  "/api/v1": [MyRouter2, MyRouter3]
});
```

And the server is ready to be started. In the cluster initialization you can add many routes as you want. By default the package register the route `/version` to get the server running version, so you can't use this route because the package route is declared first and it will be called always.

The cluster serve initialization or setup set hooks for master process and slave process

```js
public static setup(slaveHooks?: ISlaveHooks, masterHooks?: IMasterHooks): ClusterServer;
```

The slave process hooks control the whole process of server initialization calling hook before opening MongoDB connection, after the connection is opened, before starting express server and after it's initialized and finally when the server is listening for connections.

```js
interface ISlaveHooks {
  preMongo?: () => Promise<void>;
  postMongo?: () => Promise<void>;
  preExpress?: () => Promise<void>;
  postExpress?: (app: express.Application) => Promise<void>;
  running?: () => Promise<void>;
}
```

The master process hooks allow to handle when a new worker is started.

```js
interface IMasterHooks {
  worker?: (worker: any) => Promise<void>;
}
```

By default each slave process follow an initialization process:

- Connect database
- Initialize express server
- Listen by connections

With the help of slaves hooks you can inject actions between this steps, for example: authenticating against a service or requesting external information. But in certain cases it's needed change the whole process. At moment of start the cluster you can add a custom master and slave runner.

```js
public run(routes?: any, customMaster?: () => void, customSlave?: (server: HttpServer, routes?: any) => void);
```

If the master runner is set, it must do the manual call to create and handle the slave process.

### Write single thread server

To start a single threaded server we must execute the initialization process using the `HttpServer` class:

```js
import { HttpServer } from "@ikoabo/server";
import MyRouter1 from "./routes1";
import MyRouter2 from "./routes2";
import MyRouter3 from "./routes3";

/* Initialize the server */
const server = HttpServer.shared;

/* Connect MongoDB database */
server
  .initMongo()
  .then(() => {
    /* Init express server */
    server
      .initExpress(0, {
        "/api/v1/greetings": MyRouter1,
        "/api/v1": [MyRouter2, MyRouter3]
      })
      .then(() => {
        /* Start http server */
        server
          .listen(3000)
          .then(() => {
            // Server is running
          })
          .catch((err) => {
            console.error("Error starting http server: " + JSON.stringify(err));
            process.exit(-1);
          });
      })
      .catch((err) => {
        console.error("Error starting express server: " + JSON.stringify(err));
        process.exit(-1);
      });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB: " + JSON.stringify(err));
    process.exit(-1);
  });
```

To add customized options to express application server yo can use the HttpServer function:

```js
server.use("/api/v2", MyRouter3);
```

Or can access directly to the express application server:

```js
const expressApp = server.app;
```

## Using middlewares

The server package includes some middlewares that optional can be used. These are some middlewares used in the IKOA Business Platform development.

### Response handlers

The response handlers are middlewares to handle the express api response for success or error response.

Success handler always send responses in JSON format, it only transform the response data to JSON and stream it to the client. To receive the response the server package the express response `locals` variable. Inside it handle `response`, any other variable in `locals` is not handled into the success handler.

Error handler takes into account several error sources like MongoDB, Joi validators, authentication service or the platform error schema:

```js
interface IError {
  boError: number;
  boStatus: number;
  boData: any;
}
```

For specific error sources, not all posible values are handled, only an small set of it are handled. If your server need handle an specific error type you can make your own handle error or can add an error handler middlewate that translate the error to the platform error schema.

The platform error schema is translated to an express response setting the response stats to the value of `boStatus` or by default `400` if its omitted. The body of the response has the following schema:

```js
{
  error: number; // Get from boError
  data: any; // Get from boData
}
```

We can write our router like:

```js
import { Router, Request, Response, NextFunction } from "express";
import { ResponseHandler } from "@ikoabo/server";
const router = Router();

router.get(
  "/hello",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.query["error"]) {
      /* Raise error handler */
      return next({ boError: 1012, boStatus: 403 });
    }

    /* Send response with success handler */
    res.locals["response"] = {
      name: "John Doe",
      city: "New York",
      age: 25
    };
    next();
  },
  ResponseHandler.success,
  ResponseHandler.error
);

export default router;
```

### Data validation

To allow data validation the package includes a middleware to validate any request data. Data validation is done using Joi schemas. The server package exports a custom instance of Joi with objectId validation.

Using validators router can be rewritten

```js
import { Router, Request, Response, NextFunction } from "express";
import { ResponseHandler, Validator, ValidateObjectId } from "@ikoabo/server";
const router = Router();

router.post(
  "/hello/:id",
  Validator.joi(ValidateObjectId, "params"), // Validate that :id parameter is an ObjectId
  Validator.joi(OtherJoiSchemaBody), // Validate the request body with the given schema
  Validator.joi(OtherJoiSchemaQuery, "query"), // Validate the request query parameters with the given schema
  (req: Request, res: Response, next: NextFunction) => {
    if (req.query["error"]) {
      /* Raise error handler */
      return next({ boError: 1012, boStatus: 403 });
    }

    /* Send response with success handler */
    res.locals["response"] = {
      name: "John Doe",
      city: "New York",
      age: 25
    };
    next();
  },
  ResponseHandler.success,
  ResponseHandler.error
);

export default router;
```

In this case the validator it's integrated with the error response handler, raising errors in the platform schema.

## Using data model utilities

Another of the advantage of the package is the data model utilities classes. The package include a class to create Mongoose data models using `Typegoose` annotations and also include a class to create a basic CRUD controller.

### Creating my first data model

To create our first data model we use the `BaseModel` class. This class include optional fields to handle document owning and document status.

```js
class BaseModel {
  @prop({ required: true, default: SERVER_STATUS.ENABLED })
  status?: number;

  @prop({ type: mongoose.Types.ObjectId })
  owner?: string;

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  @prop({ type: mongoose.Types.ObjectId })
  modifiedBy?: string;
}
```

The document owner and modifiedBy can be used to integrate with an user controller server and set document property and give more security to our server data. The first model can be:

```js
import mongoose from "mongoose";
import { BaseModel } from "@ikoabo/server";
import { getModelForClass, prop, DocumentType, index } from "@typegoose/typegoose";

@index({name:1}, {unique: true})
export class MyModel extends BaseModel {
  @prop({required: true, unique: true})
  name!: string;

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(MyModel, {
      schemaOptions: {
        collection: "my-models",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            return _doc;
          },
        },
      },
      options: { automaticName: false },
    });
  }
}

export type MyModelDocument = DocumentType<MyModel>;
export const MyModelModel: mongoose.Model<MyModelDocument> = MyModel.shared;
```

For each model we recommend create and export the document and the model to allow the integration with the data controller.

### Creating my first data controller

The data controller can be implemented extending the `CRUD` class:

```js
import { CRUD } from "@ikoabo/core_srv";
import { MuModel, MyModelDocument, MyModelModel } from "@/models/events.model";

class MyModelCtrl extends CRUD<MyModel, MyModelDocument>{
  private static _instance: MyModelCtrl;

  private constructor() {
    super('MyModel Controller', MyModelModel);
  }

  public static get shared(): MyModelCtrl {
    if (!MyModelCtrl._instance) {
      MyModelCtrl._instance = new MyModelCtrl();
    }
    return MyModelCtrl._instance;
  }
}
```

The `CRUD` class add to our data controller functions to handle de Mongoose model. Custom data manipulation can be implemented into the controller or called directly on the Mongoose model. The delete action implemented into the CRUD it's a soft-delete, data isn't removed from server, only the status field is marked as deleted.

```js
abstract class CRUD<T, D extends mongoose.Document> {
  protected _model: mongoose.Model<D>;
  protected _logger: Logger;

  public create(data: T): Promise<D>;
  public update(queryId: string | any, data?: T, update?: any, options?: any): Promise<D>;
  public fetch(queryId: string | any, options?: any, populate?: string[]): Promise<D>;
  public fetchAll(queryId: any, options?: any, populate?: string[]): mongoose.QueryCursor<D>;
  public fetchRaw(queryId: any, options?: any, populate?: string[]): mongoose.DocumentQuery<D[], D>;
  public delete(queryId: string | any): Promise<D>;
  protected _updateStatus(queryId: string | any, status: SERVER_STATUS): Promise<D>;
  public validate(path: string, owner?: string);
}
```

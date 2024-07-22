# Developer Server Package

Utility functions for basic development. This library is part of ECUALEAD Microservices Infraestructure.

[![Version npm](https://img.shields.io/npm/v/@ecualead/server.svg?style=flat-square)](https://www.npmjs.com/package/@ecualead/server)[![npm Downloads](https://img.shields.io/npm/dm/@ecualead/server.svg?style=flat-square)](https://npmcharts.com/compare/@ecualead/server?minimal=true)

[![NPM](https://nodei.co/npm/@ecualead/server.png?downloads=true&downloadRank=true)](https://nodei.co/npm/@ecualead/server/)

## Installation

```bash
npm install @ecualead/server
```

## Environment variables

To run a microservice using `@ecualead/server` there are some environment variables that can be configured to initialize the server. Environment variables are separated into three groups.

### General server settings
- `INSTANCES`: Number of instances to run inside the cluster of process, by default `1` if the variable is omitted.
- `INTERFACE`: Set the service listening interface, by default `127.0.0.1` if the variable is omitted.
- `PORT`: Set the service listening port, by default `3000` if the variable is omitted.

### HTTP Server settings
- `HTTP_BODY_SIZE`: Set the maximum request body size, by default it use the configured value in `express`.
- `HTTP_NOT_METHOD_OVERRIDE`: If it's `true` prevent Express to configure HTTP verbs such as PUT or DELETE in places where the client doesn't support it. Any value different of `true` is considered as false.
- `HTT_NOT_CORS`: If it's `true` prevent Express allowing CORS access. Any value different of `true` is considered as false. In this service implementation CORS is allowed for all origins. If you need a more specific configuration, then global CORS must be disabled and enabled manually in the required points.
- `HTTP_NOT_TRUST_PROXY`: If it's `true` prevent Express set the `trust proxy` configuration. Any value different of `true` is considered as false.

### Logging settings
- `LOG`: Components log level, it use the `Logger` wrapper. By default `error` if the variable is omitted.
- `BODY_TRACE`: Set if the request body must be debbuged in development mode.
- `RESPONSE_TRACE`: Set if the response body must be debbuged in development mode.

## Write my first server

To start your first server only needs develop the routes to be called, for example:

```js
import { express as e, ClusterServer } from "@ecualead/server";

const router = e.Router();
router.get("/hello", (req: e.Request, res: e.Response, next: e.NextFunction) => {
  res.send("Hello World");
  res.end();
});

/* Initialize cluster server */
const clusterServer = ClusterServer.setup();

/* Run cluster with routes */
clusterServer.run({
  "/greetings": router,
});
```

If the user set the `INSTANCES` environment variable to a value grater than 1 the server will be running in a cluster mode, if not, the server will be running in a single thread mode.

Now the server is ready. In the cluster initialization you can add many routes as you want. By default the package register the route `/health` to validate the server healthy returning the server running version.

### Server initialization hooks

For the server initialization there are a set of hooks that can be used to add custom code between the server initialization. There are two types of hooks: slave hooks and master hooks. Slave hooks are used to control the initialization on the slave process when server is running in cluster mode, and is also used to control the initialization when the server runs in single thread mode. Master hooks are only aplied to the master process when the server is runing in cluster mode.

The use the hooks we can include them in the call to the cluster setup:

```js
public static setup(slaveHooks?: ISlaveHooks, masterHooks?: IMasterHooks): ClusterServer;
```

The slave process hooks control the whole process of server initialization calling hook before configuring the http server, before loading defined routes, after the http server is initalized and after start listening on the configured port.

```js
interface ISlaveHooks {
  onBeforeLoadServer?: () => Promise<void>;
  onBeforeLoadRoutes?: (app: express.Application) => Promise<void>;
  onAfterLoadServer?: (app: express.Application) => Promise<void>;
  onAfterListen?: () => Promise<void>;
}
```

The master process hooks allow to handle when a new worker is started.

```js
interface IMasterHooks {
  onRunWorker?: (worker: any) => Promise<void>;
}
```

By default each slave process follow an initialization process:

- Call hook before http server initialization
- Initialize http server
- Call hook before loading the routes
- Load defined routes
- Call hook after http server initialization
- Listen by connections
- Call hook after start listening

With the help of slaves hooks you can inject actions between this steps, for example: authenticating against a service or requesting external information. 

### Customize the master/slave initialization

in certain cases it's needed change the whole process for the master and/or the slave process to run custom initialization, like for example Socket.io server. This customization can be done at the moment that we call to start runing the cluster.

```js
public run(routes?: any, customMaster?: (instances: number) => void, customSlave?: (server: HttpServer, routes?: any) => void);
```

If the master runner is set, it must do the manual call to create using `fork` and handle the slave process.

### Write raw single thread server

To start a single threaded server we must execute the initialization process using the `HttpServer` class:

```js
import { express as e, HttpServer } from "@ecualead/server";

const router = e.Router();
router.get("/hello", (req: e.Request, res: e.Response, next: e.NextFunction) => {
  res.send("Hello World");
  res.end();
});

/* Initialize the server */
const server = HttpServer.shared;

const initServer = async () => {  
  /* Init http server */
  await server.initHttpServer(null, null, {
    "/greetings": router,
  })
  
  /* Start the slave worker HTTP server */
  await server.startListen();
}

initServer();
```

To add customized options to express application server yo can use the HttpServer function:

```js
server.use("/api/v2", MyRouter3);
```

Or can access directly to the express application server:

```js
const expressApp = server.app;
```

## Using middleware

The server package includes some middleware that can be used. By default the server initialization use the response middleware to handle the success responses and the error responses.

### Response handlers

The response handlers are middleware to handle the express api response for success or error response.

Success handler always send responses in JSON format, it only transform the response data to JSON and stream it to the client. To receive the response the server package the express response `locals` variable. Inside it handle `response`, any other variable in `locals` is not handled into the success handler.

Error handler takes into account general error sources like MongoDB, Joi validators, authentication service between others.

For specific error sources, not all possible values are handled, only an small set of it are handled and defined in `SERVER_ERRORS`. If your server need handle an specific error type you can make your own handle error or can add an error handler middleware that translate the error to the platform error schema. To create new errors you can initialize them with the constructor:

```
new IError(str: string, status: HTTP_STATUS = HTTP_STATUS.HTTP_4XX_BAD_REQUEST, data?: any)
```

The platform error schema is translated to an express response setting the response status to the value of `status` or by default `400` if its omitted. The body of the response has the following schema:

```js
{
  error: string; // Get from error.str
  data: any; // Get from error.data
}
```

We can write our router like:

```js
import { ResponseHandler, express as e, IError } from "@ecualead/server";
const router = e.Router();

router.get(
  "/hello",
  (req: e.Request, res: e.Response, next: e.NextFunction) => {
    if (req.query["error"]) {
      /* Raise error handler */
      return next(new IError("unknown-error", HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR));
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
import { ResponseHandler, Validator, express as e } from "@ecualead/server";
const router = e.Router();

router.post(
  "/hello/:id",
  Validator.joi(OtherJoiSchemaBody), // Validate the request body with the given schema
  Validator.joi(OtherJoiSchemaQuery, "query"), // Validate the request query parameters with the given schema
  (req: e.Request, res: e.Response, next: e.NextFunction) => {
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
  }
);

export default router;
```

In this case the validator it's integrated with the error response handler, raising errors in the platform schema.

## Predefined constants

Package include a set of predefined constants to be used inside backend/frontend development.
It includes constants to prefeined object status, prefined general errors, logs level, and HTTP status responses.

```js
import { LOG_LEVEL, SERVER_ERRORS, HTTP_STATUS } from "@ecualead/server";
```

## Using Logger

Logger is an small wrapper of [`winston`][winston] logger. It only hande logs to the console
output and must be configured on server initialization. Logger support the same log levels of
[`winston`][winston].

```js
import { Logger, LOG_LEVEL } from "@ecualead/server";

/* Set the global log level */
Logger.setLogLevel(LOG_LEVEL.DEBUG);

/* Initialize the logger for multiple components */
const logger1 = new Logger("MiComponent");
const logger2 = new Logger("OtherComponent");

/* Log an error from one logger */
logger1.error("Error from one component", {
  code: 2,
  msg: "Invalid call"
});

/* Log a debug message from the other logger */
logger2.debug("Debug from another component", {
  field: "social",
  value: 10
});
```

## Using Arrays utilities functions

Arrays implements functions to improve array data manipulation. it implements functions to ensure array initialization with include/exclude values, array sort, binary search and multiple arrays intersection.

```js
import { Arrays } from "@ecualead/server";
let arr1 = [1, 2, 3, 5, 7];
let arrInclude = [3, 15, 6];
let arrExclude = [2, 5];

/* Get new array [1, 3, 7, 15, 6]
 * New array will contains the arr1 values, including arrInclude values but removing arrExclude values
 */
let newArr = Arrays.create<number>(arr1, arrInclude, arrExclude);
console.log(newArr);

/* Sort the array and search a value inside the array */
Arrays.sort<number>(newArr);
console.log(Arrays.search(newArr, 7)); // Prints 3

/* Intersect multiple arrays, gets [3] */
let intArr = Arrays.intersect<number>(newArr, arr1, arrInclude);
console.log(intArr);
```

## Using Objects utilities functions

Objects utilities functions allow to fetch object properties and set
a default value if any path don't exists.

```js
import { Objects } from "@ecualead/server";

let obj = {
  alfa: {
    profiles: [
      {
        name: "Jhon",
        age: 25
      }
    ]
  }
};

/* Print Jhon */
console.log(Objects.get(obj, "alfa.profiles.0.name", "no-name"));

/* Try to get non existent property */
if (!Objects.get(obj, "alfa.profiles.0.social.facebook")) {
  console.log("Facebook not configured");
}
```

Also functions allow to set an object value following the geiven path.
If any elements inside path don't exists then it's created.

```js
import { Objects } from "@ecualead/server";

let obj = {
  alfa: {
    profiles: [
      {
        name: "Jhon",
        age: 25
      }
    ]
  }
};

/* Update property */
Objects.set(obj, "alfa.profiles.0.name", "Jhon Doe");
console.log(Objects.get(obj, "alfa.profiles.0.name"));

/* Set non existent property */
Objects.set(obj, "alfa.profiles.0.social.facebook.profile", "facebookid");
console.log(Objects.get(obj, "alfa.profiles.0.social.facebook.profile"));
```

## Using Tokens utilities functions

Tokens its a set of function to generate pseudorandoms tokens. There are functions to generate
short, medium and long tokens. Short and medium token are generated with [`uniqid`][uniqid] and long tokens are generated with [`sha.js`][sha.js].

```js
import { Tokens } from "@ecualead/server";

/* Generate short token (8 byte) */
const shortToken = Tokens.short;

/* Generate medium token */
const mediumToken1 = Tokens.medium1; // 12 bytes
const mediumToken2 = Tokens.medium2; // 18 bytes

/* Generate long token with sha256 */
const longToken = Tokens.long;
```

## Using Streams

Stream class allow to pipe streamed data to the `express` response. User can use a filter function to prepare the object data to be sent into the response. Filter function its an optional parameter.

```js
import { Streams } from "@ecualead/server";

...

router.get("/data",
  (req: Request, res: Response, _next: NextFunction) => {
    MongoModel.find({ ... }).cursor().pipe(Streams.stringify((data: any)=>{
      return {
        id: data.id,
        name: data.name
      };
    })).pipe(res.type("json"));
  },
  ResponseHandler.success,
  ResponseHandler.error
);
```

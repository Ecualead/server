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
import { Request, Response, NextFunction } from "express";
import mongoose, { EnforceDocument } from "mongoose";
import { SERVER_ERRORS } from "../constants/errors.enum";
import { SERVER_STATUS } from "../constants/status.enum";
import { Objects } from "../utils/objects.util";
import { Logger } from "./logger.controller";

export interface ICRUDOptions {
  modelName?: string;
  preventStatusQuery?: boolean;
}

export abstract class CRUD<D extends mongoose.Document> {
  protected _model: mongoose.Model<D>;
  protected _logger: Logger;
  private _opts: ICRUDOptions;

  /**
   *
   * @param loggers
   * @param model
   * @param modelname
   */
  constructor(logger: string, model: mongoose.Model<D>, opts?: ICRUDOptions) {
    this._logger = new Logger(logger);
    this._model = model;
    this._opts = opts || {
      modelName: model.name,
      preventStatusQuery: false
    };
  }

  /**
   * Create new document object
   *
   * @param data
   */
  public create(data: any | any[]): Promise<D | D[]> {
    return this._model.create(data);
  }

  /**
   * Prepare the mongoose query with an id string or query object
   *
   * @param queryId
   */
  private _prepareQuery(queryId: string | any) {
    if (typeof queryId === "string" || mongoose.isValidObjectId(queryId)) {
      return { _id: queryId };
    }

    /* Check for status query prevent */
    if (!this._opts.preventStatusQuery) {
      const status = Objects.get(queryId, "status", null);
      if (status === null) {
        queryId["status"] = { $gt: SERVER_STATUS.UNKNOWN };
      }
    }
    return queryId;
  }

  /**
   * Update document object
   *
   * @param queryId
   * @param dataSet
   * @param update
   * @param options
   */
  public update(queryId: string | any, dataSet?: any, update?: any, options?: any): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const query: any = this._prepareQuery(queryId);

      /* Ensure update variable is valid */
      if (!update) {
        update = {};
      }

      /* Check if data is set */
      if (dataSet) {
        update["$set"] = dataSet;
      }

      /* Ensure update variable is valid */
      if (!options) {
        options = {};
      }

      /* Check if the new option is set */
      if (Objects.get(options, "new", null) === null) {
        options["new"] = true;
      }

      /* Check to disable raw result */
      if (Objects.get(options, "rawResult", null) === null) {
        options["rawResult"] = false;
      }

      /* Find and update one document */
      this._model
        .findOneAndUpdate(query, update, options)
        .then((value: any) => {
          if (!value) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }
          resolve(value as D);
        })
        .catch(reject);
    });
  }

  /**
   * Fetch and object
   *
   * @param queryId
   * @param options
   * @param populate
   */
  public fetch(
    queryId: string | any,
    options?: any,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const query = this._prepareQuery(queryId);

      /* Initialize the Mongoose query */
      let baseQuery = this._model.findOne(query, options ? options : {});

      /* Check if the populate value is set */
      if (populate) {
        populate.forEach((value: string) => {
          baseQuery = baseQuery.populate(value);
        });
      }

      /* Check for entries sort */
      if (sort) {
        baseQuery.sort(sort);
      }

      /* Check for entries skip */
      if (skip) {
        baseQuery = baseQuery.skip(skip);
      }

      /* Check for entries limit */
      if (limit) {
        baseQuery = baseQuery.limit(limit);
      }

      /* Execute the query */
      baseQuery
        .then((value: D) => {
          if (!value) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }
          resolve(value);
        })
        .catch(reject);
    });
  }

  /**
   * Fetch all objects as stream cursor
   *
   * @param queryId
   * @param options
   * @param populate
   */
  public fetchAll(
    queryId: any,
    options?: any,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): mongoose.QueryCursor<D> {
    /* Prepare the query object */
    const query = this._prepareQuery(queryId);

    /* Initialize the Mongoose query */
    let baseQuery = this._model.find(query, options ? options : {});

    /* Check if the populate value is set */
    if (populate) {
      populate.forEach((value: string) => {
        baseQuery = baseQuery.populate(value);
      });
    }

    /* Check for entries sort */
    if (sort) {
      baseQuery.sort(sort);
    }

    /* Check for entries skip */
    if (skip) {
      baseQuery = baseQuery.skip(skip);
    }

    /* Check for entries limit */
    if (limit) {
      baseQuery = baseQuery.limit(limit);
    }

    /* Return cursor query */
    return baseQuery.cursor();
  }

  /**
   * Fetch all objects as raw query
   *
   * @param queryId
   * @param options
   * @param populate
   */
  public fetchRaw(
    queryId: any,
    options?: any,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): mongoose.Query<EnforceDocument<D, {}, {}>[], EnforceDocument<D, {}, {}>, {}, D> {
    /* Prepare the query object */
    const query = this._prepareQuery(queryId);

    /* Initialize the Mongoose query */
    let baseQuery = this._model.find(query, options ? options : {});

    /* Check if the populate value is set */
    if (populate) {
      populate.forEach((value: string) => {
        baseQuery = baseQuery.populate(value);
      });
    }

    /* Check for entries sort */
    if (sort) {
      baseQuery.sort(sort);
    }

    /* Check for entries skip */
    if (skip) {
      baseQuery = baseQuery.skip(skip);
    }

    /* Check for entries limit */
    if (limit) {
      baseQuery = baseQuery.limit(limit);
    }

    /* Return query */
    return baseQuery;
  }

  /**
   * SoftDelete the given object
   *
   * @param queryId
   */
  public delete(queryId: string | any): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const query = this._prepareQuery(queryId);
      const update: any = { $set: { status: SERVER_STATUS.SOFT_DELETE } };
      this._model
        .findByIdAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }
          resolve(value);
        })
        .catch(reject);
    });
  }

  /**
   * Update an object status
   *
   * @param queryId
   * @param status
   */
  protected _updateStatus(queryId: string, status: SERVER_STATUS): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const query = this._prepareQuery(queryId);

      const update: any = { $set: { status: status } };
      this._model
        .findOneAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }
          resolve(value);
        })
        .catch(reject);
    });
  }

  /**
   * Middleware to fetch a valid object by its ID and check the owner if its necessary
   *
   * @param path Path to get ObjectID from request
   * @param owner User owner ObjectID
   */
  public isValidOwner(path: string, owner?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const objId = Objects.get(req, path, null);
      const ownerId = owner ? Objects.get(res, owner, null) : null;

      /* Check for valid obj id */
      if (!objId) {
        return next({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
      }

      /* Look for the target object */
      this.fetch(objId)
        .then((value: any) => {
          /* Check if the given module is valid */
          if (!value || value.status !== SERVER_STATUS.ENABLED) {
            return next({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }

          /* Check the object owner if its necessary */
          if (ownerId && value.owner.toString() !== ownerId) {
            return next({ boError: SERVER_ERRORS.INVALID_OWNER });
          }

          /* Store the object information to be used into the next middleware */
          res.locals[this._opts.modelName] = value;
          next();
        })
        .catch(next);
    };
  }

  /**
   * Set the document object as enabled
   *
   * @param id
   * @returns
   */
  public enable(id: string): Promise<D> {
    const query: any = { _id: id, status: SERVER_STATUS.DISABLED };
    return this._updateStatus(query, SERVER_STATUS.ENABLED);
  }

  /**
   * Set the document object as disabled
   *
   * @param id
   * @returns
   */
  public disable(id: string): Promise<D> {
    const query: any = { _id: id, status: SERVER_STATUS.ENABLED };
    return this._updateStatus(query, SERVER_STATUS.DISABLED);
  }

  /**
   * Execute a database operation over a filed with the given value
   *
   * @param op
   * @param id
   * @param field
   * @param value
   * @returns
   */
  private _fieldOp(op: string, id: string, field: string, value: any): Promise<D> {
    const query: any = { _id: id, status: { $gt: SERVER_STATUS.UNKNOWN } };
    const obj: any = {};
    obj[`${field}`] = value;
    const update: any = {};
    update[`${op}`] = obj;

    return this.update(query, {}, update);
  }

  /**
   * Execute addToSet op over field
   *
   * @param id
   * @param field
   * @param value
   * @returns
   */
  public addToSet(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$addToSet", id, field, value);
  }

  /**
   * Execute push op over field
   *
   * @param id
   * @param field
   * @param value
   * @returns
   */
  public push(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$push", id, field, value);
  }

  /**
   * Execute pushAll op over field
   *
   * @param id
   * @param field
   * @param value
   * @returns
   */
  public pushAll(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pushAll", id, field, value);
  }

  /**
   * Execute pull op over field
   *
   * @param id
   * @param field
   * @param value
   * @returns
   */
  public pull(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pull", id, field, value);
  }

  /**
   * Execute pullAll op over field
   *
   * @param id
   * @param field
   * @param value
   * @returns
   */
  public pullAll(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pullAll", id, field, value);
  }
}

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
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { SERVER_ERRORS } from "../constants/errors.enum";
import { SERVER_STATUS } from "../constants/status.enum";
import { Objects } from "../utils/objects.util";
import { Logger } from "./logger.controller";

export interface ICRUDOptions {
  modelName?: string;
  preventStatusQuery?: boolean;
}

export type IQueryParameters = string | mongoose.Types.ObjectId | mongoose.FilterQuery<any>;

export interface IQueryOptions extends mongoose.QueryOptions {
  preventStatus?: boolean;
}

export abstract class CRUD<D extends mongoose.Document> {
  protected _model: mongoose.Model<D>;
  protected _logger: Logger;
  private _opts: ICRUDOptions;

  /**
   * CRUD constructor
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
   */
  public create(data: any | any[]): Promise<D | D[]> {
    return this._model.create(data);
  }

  /**
   * Prepare the mongoose query with an id string or query object
   */
  private _prepareQuery(query: IQueryParameters, preventStatus = false): mongoose.FilterQuery<any> {
    if (typeof query === "string" || mongoose.isValidObjectId(query)) {
      return { _id: query };
    }

    /* Check for status query prevent */
    if (!this._opts.preventStatusQuery && !preventStatus) {
      const status = Objects.get(query, "status", null);
      if (status === null) {
        (query as any)["status"] = { $gt: SERVER_STATUS.UNKNOWN };
      }
    }
    return query;
  }

  /**
   * Apply parameter to a query
   */
  private _applyQueryParameters(
    query: mongoose.Query<any, any>,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): mongoose.Query<any, any> {
    /* Check if the populate value is set */
    if (populate) {
      populate.forEach((value: string) => {
        query = query.populate(value);
      });
    }

    /* Check for entries sort */
    if (sort) {
      query = query.sort(sort);
    }

    /* Check for entries skip */
    if (skip) {
      query = query.skip(skip);
    }

    /* Check for entries limit */
    if (limit) {
      query = query.limit(limit);
    }

    return query;
  }

  /**
   * Update the document object
   */
  public update(
    query: IQueryParameters,
    dataSet?: mongoose.UpdateQuery<D>,
    update?: mongoose.UpdateQuery<D>,
    options?: IQueryOptions
  ): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const queryObj = this._prepareQuery(query, options?.preventStatus);

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
        .findOneAndUpdate(queryObj, update, options)
        .then((value?: D) => {
          if (!value) {
            return reject({ boError: SERVER_ERRORS.OBJECT_NOT_FOUND });
          }
          resolve(value);
        })
        .catch(reject);
    });
  }

  /**
   * Fetches a single document object
   */
  public fetch(
    query: IQueryOptions,
    options?: IQueryOptions,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const queryObj = this._prepareQuery(query);

      /* Initialize the Mongoose query */
      let baseQuery: mongoose.Query<any, D> = this._model.findOne(queryObj, options ? options : {});
      baseQuery = this._applyQueryParameters(baseQuery, populate, sort, skip, limit);

      /* Execute the query */
      baseQuery
        .then((value?: D) => {
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
   */
  public fetchAll(
    query: IQueryOptions,
    options?: IQueryOptions,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): mongoose.QueryCursor<D> {
    /* Prepare the query object */
    const queryObj = this._prepareQuery(query);

    /* Initialize the Mongoose query */
    let baseQuery = this._model.find(queryObj, options ? options : {});
    baseQuery = this._applyQueryParameters(baseQuery, populate, sort, skip, limit);

    /* Return cursor query */
    return baseQuery.cursor();
  }

  /**
   * Fetch all objects as raw query
   */
  public fetchRaw(
    query: IQueryOptions,
    options?: IQueryOptions,
    populate?: string[],
    sort?: any,
    skip?: number,
    limit?: number
  ): mongoose.Query<any, D> {
    /* Prepare the query object */
    const queryObj = this._prepareQuery(query);

    /* Initialize the Mongoose query */
    let baseQuery = this._model.find(queryObj, options ? options : {});
    baseQuery = this._applyQueryParameters(baseQuery, populate, sort, skip, limit);

    /* Return query */
    return baseQuery;
  }

  /**
   * SoftDelete the given object
   */
  public delete(query: IQueryOptions): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const queryObj = this._prepareQuery(query);
      const update: any = { $set: { status: SERVER_STATUS.SOFT_DELETE } };
      this._model
        .findOneAndUpdate(queryObj, update, { new: true })
        .then((value?: D) => {
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
   */
  protected _updateStatus(query: IQueryOptions, status: SERVER_STATUS): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const queryObj = this._prepareQuery(query);

      const update: any = { $set: { status: status } };
      this._model
        .findOneAndUpdate(queryObj, update, { new: true })
        .then((value?: D) => {
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
        .then((value?: any) => {
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
   */
  public enable(id: string): Promise<D> {
    const query: any = { _id: id, status: SERVER_STATUS.DISABLED };
    return this._updateStatus(query, SERVER_STATUS.ENABLED);
  }

  /**
   * Set the document object as disabled
   */
  public disable(id: string): Promise<D> {
    const query: any = { _id: id, status: SERVER_STATUS.ENABLED };
    return this._updateStatus(query, SERVER_STATUS.DISABLED);
  }

  /**
   * Execute a database operation over a filed with the given value
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
   */
  public addToSet(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$addToSet", id, field, value);
  }

  /**
   * Execute push op over field
   */
  public push(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$push", id, field, value);
  }

  /**
   * Execute pushAll op over field
   */
  public pushAll(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pushAll", id, field, value);
  }

  /**
   * Execute pull op over field
   */
  public pull(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pull", id, field, value);
  }

  /**
   * Execute pullAll op over field
   */
  public pullAll(id: string, field: string, value: any): Promise<D> {
    return this._fieldOp("$pullAll", id, field, value);
  }
}

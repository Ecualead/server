/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Server API.
 */
import { SERVER_ERRORS, SERVER_STATUS, HTTP_STATUS, Objects, Logger } from "@ikoabo/core";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export abstract class CRUD<T, D extends mongoose.Document> {
  protected _model: mongoose.Model<D>;
  protected _logger: Logger;
  private _modelname: string;

  /**
   *
   * @param logger
   * @param model
   * @param modelname
   */
  constructor(logger: string, model: mongoose.Model<D>, modelname?: string) {
    this._logger = new Logger(logger);
    this._model = model;
    this._modelname = modelname || "";
  }

  /**
   * Create new document object
   *
   * @param data
   */
  public create(data: T): Promise<D> {
    this._logger.debug("Creating new document", data);
    return this._model.create(<any>data);
  }

  /**
   * Prepare the mongoose query with an id string or query object
   *
   * @param queryId
   */
  private _prepareQuery(queryId: string | any) {
    if (typeof queryId === "string" || mongoose.isValidObjectId(queryId)) {
      return { _id: queryId };
    } else {
      const status = Objects.get(queryId, "status", null);
      if (status === null) {
        queryId["status"] = { $gt: SERVER_STATUS.UNKNOWN };
      }
      return queryId;
    }
  }

  /**
   * Update document object
   *
   * @param queryId
   * @param dataSet
   * @param update
   * @param options
   */
  public update(queryId: string | any, dataSet?: T, update?: any, options?: any): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Prepare the query object */
      const query = this._prepareQuery(queryId);

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

      /* Find and update one document */
      this._model
        .findOneAndUpdate(query, update, options)
        .then((value: D) => {
          if (!value) {
            reject({
              boError: SERVER_ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_4XX_NOT_FOUND
            });
            return;
          }
          resolve(value);
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
  public fetch(queryId: string | any, options?: any, populate?: string[]): Promise<D> {
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

      /* Execute the query */
      baseQuery
        .then((value: D) => {
          if (!value) {
            reject({
              boError: SERVER_ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_4XX_NOT_FOUND
            });
            return;
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
  public fetchAll(queryId: any, options?: any, populate?: string[]): mongoose.QueryCursor<D> {
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
    populate?: string[]
  ): mongoose.DocumentQuery<D[], D> {
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
            reject({
              boError: SERVER_ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_4XX_NOT_FOUND
            });
            return;
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
            reject({
              boError: SERVER_ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_4XX_NOT_FOUND
            });
            return;
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
  public validate(path: string, owner?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const ownerStr = owner ? Objects.get(res, owner, null) : null;
      this.fetch(Objects.get(req, path, ""))
        .then((value: any) => {
          /* Check if the given module is valid */
          if (!value || value.status !== SERVER_STATUS.ENABLED) {
            return next({
              boError: SERVER_ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_4XX_NOT_FOUND
            });
          }

          /* Check the object owner if its necessary */
          if (ownerStr && value.owner.toString() !== ownerStr) {
            return next({
              boError: SERVER_ERRORS.INVALID_OWNER,
              boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN
            });
          }

          /* Store the object information to be used into the next middleware */
          res.locals[this._modelname] = value;
          next();
        })
        .catch(next);
    };
  }
}

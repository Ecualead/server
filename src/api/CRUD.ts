/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-05-27T00:22:22-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: ProjectName
 * @Filename: CRUD.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-05-30T07:24:35-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import mongoose from "mongoose";
import { Logger } from "./Logger";
import { ERRORS } from "../types/errors";
import { BASE_STATUS } from "../types/status";
import { Request, Response, NextFunction } from "express";
import { Objects } from "../utils/Objects";
import { HTTP_STATUS } from "../middlewares/ResponseHandler";

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
    return this._model.create(data);
  }

  /**
   * Update document object
   *
   * @param id
   * @param data
   * @param query
   */
  public update(id: string, data: T, query?: any): Promise<D> {
    this._logger.debug("Updating document", { id: id, data: data });
    return new Promise<D>((resolve, reject) => {
      /* Ensuere query is defined */
      if (!query) {
        query = {};
      }

      query["_id"] = id;
      if (!query["status"]) {
        query["status"] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      const update: any = { $set: data };
      this._model
        .findOneAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({
              boError: ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_NOT_FOUND,
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
   * @param id
   * @param query
   * @param options
   * @param populate
   */
  public fetch(
    id?: string,
    query?: any,
    options?: any,
    populate?: string[]
  ): Promise<D> {
    this._logger.debug("Fetch document", {
      id: id,
      options: options,
      populate: populate,
    });
    return new Promise<D>((resolve, reject) => {
      /* Ensuere query is defined */
      if (!query) {
        query = {};
      }

      /* Gilter query by ID */
      if (id) {
        query["_id"] = id;
      }

      /* Filter query by status */
      if (!query["status"]) {
        query["status"] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }

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
              boError: ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_NOT_FOUND,
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
   * @param query
   * @param options
   * @param populate
   */
  public fetchAll(
    query?: any,
    options?: any,
    populate?: string[]
  ): mongoose.QueryCursor<D> {
    this._logger.debug("Fetch all documents");
    /* Ensuere query is defined */
    if (!query) {
      query = {};
    }

    /* Check for defined status */
    if (!query["status"]) {
      query["status"] = { $gt: BASE_STATUS.BS_UNKNOWN };
    }

    /* Initialize the Mongoose query */
    let baseQuery = this._model.findOne(query, options ? options : {});

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
   * SoftDelete the given object
   *
   * @param id ObjectID to be deleted
   * @param query Additional query data to fetch object to be deleted
   */
  public delete(id: string, query?: any): Promise<D> {
    this._logger.debug("Delete document", { id: id });
    return new Promise<D>((resolve, reject) => {
      /* Ensuere query is defined */
      if (!query) {
        query = {};
      }

      query["_id"] = id;
      if (!query["status"]) {
        query["status"] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }

      const update: any = { $set: { status: BASE_STATUS.BS_SOFT_DELETE } };
      this._model
        .findByIdAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({
              boError: ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_NOT_FOUND,
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
   * @param id ObjectID of the object to be updated
   * @param status New status of the modified object
   * @param query Aditional data query to fetch the object to be updated
   */
  protected _updateStatus(
    id: string,
    status: BASE_STATUS,
    query?: any
  ): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      /* Ensuere query is defined */
      if (!query) {
        query = {};
      }

      query["_id"] = id;
      if (!query["status"]) {
        query["status"] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      const update: any = { $set: { status: status } };
      this._model
        .findOneAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({
              boError: ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_NOT_FOUND,
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
      let ownerStr = owner ? Objects.get(res, owner, null) : null;
      this.fetch(Objects.get(req, path, ""))
        .then((value: any) => {
          /* Check if the given module is valid */
          if (!value || value.status !== BASE_STATUS.BS_ENABLED) {
            return next({
              boError: ERRORS.OBJECT_NOT_FOUND,
              boStatus: HTTP_STATUS.HTTP_NOT_FOUND,
            });
          }

          /* Check the object owner if its necessary */
          if (ownerStr && value.owner.toString() !== ownerStr) {
            return next({
              boError: ERRORS.INVALID_OPERATION,
              boStatus: HTTP_STATUS.HTTP_FORBIDDEN,
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

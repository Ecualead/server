/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-05-27T00:22:22-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: ProjectName
 * @Filename: CRUD.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-05-27T00:27:08-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import mongoose from 'mongoose';
import { Logger } from './Logger';
import { ERRORS } from '../types/errors';

export enum BASE_STATUS{
  BS_DELETED = -1,
  BS_UNKNOWN = 0,
  BS_DISABLED = 1,
  BS_ENABLED = 2,
}

export abstract class CRUD<T, D extends mongoose.Document>{
  protected _model: mongoose.Model<D>;
  protected _logger: Logger;


  constructor(logger: string, model: mongoose.Model<D>) {
    this._logger = new Logger(logger);
    this._model = model;
  }

  /**
   * Create new document object
   */
  public create(data: T): Promise<D> {
    this._logger.debug('Creating new document', data);
    return this._model.create(data);
  }

  /**
   * Update document object
   */
  public update(id: string, data: T, query?: any): Promise<D> {
    this._logger.debug('Updating document', { id: id, data: data });
    return new Promise<D>((resolve, reject) => {
      query['_id'] = id;
      if(!query['status']){
        query['status'] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      const update: any = { $set: data };
      this._model.findOneAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({ boError: ERRORS.OBJECT_NOT_FOUND });
            return;
          }
          resolve(value);
        }).catch(reject);
    });
  }

  /**
   * Fetch and object
   */
  public fetch(id: string, query?: any): Promise<D> {
    this._logger.debug('Fetch document', { id: id });
    return new Promise<D>((resolve, reject) => {
      query['_id'] = id;
      if(!query['status']){
        query['status'] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      this._model.findOne(query)
        .then((value: D) => {
          if (!value) {
            reject({ boError: ERRORS.OBJECT_NOT_FOUND });
            return;
          }
          resolve(value);
        }).catch(reject);
    });
  }

  /**
   * Fetch all objects as stream cursor
   */
  public fetchAll(query?: any): mongoose.QueryCursor<D> {
    this._logger.debug('Fetch all documents');
    if(!query['status']){
      query['status'] = { $gt: BASE_STATUS.BS_UNKNOWN };
    }
    return this._model.find(query).cursor();
  }

  /**
   * Delete and object
   */
  public delete(id: string, query?: any): Promise<D> {
    this._logger.debug('Delete document', { id: id });
    return new Promise<D>((resolve, reject) => {
      query['_id'] = id;
      if(!query['status']){
        query['status'] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      const update: any = { $set: { status: -1 } };
      this._model.findByIdAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({ boError: ERRORS.OBJECT_NOT_FOUND });
            return;
          }
          resolve(value);
        }).catch(reject);
    });
  }

  /**
 * Update an object status
 */
  protected _updateStatus(id: string, status: BASE_STATUS, query?: any): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      query['_id'] = id;
      if(!query['status']){
        query['status'] = { $gt: BASE_STATUS.BS_UNKNOWN };
      }
      const update: any = { $set: { status: status } };
      this._model.findOneAndUpdate(query, update, { new: true })
        .then((value: D) => {
          if (!value) {
            reject({ boError: ERRORS.OBJECT_NOT_FOUND });
            return;
          }
          resolve(value);
        }).catch(reject);
    });
  }
}

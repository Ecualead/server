import mongoose from 'mongoose';
import { Logger } from './Logger';
import { ERRORS } from '../types/errors';
import { BASE_STATUS } from '../types/status';

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
  public update(id: string, data: T): Promise<D> {
    this._logger.debug('Updating document', { id: id, data: data });
    return new Promise<D>((resolve, reject) => {
      const query: any = { _id: id, status: { $gt: BASE_STATUS.BS_UNKNOWN } };
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
  public fetch(id: string): Promise<D> {
    this._logger.debug('Fetch document', { id: id });
    return new Promise<D>((resolve, reject) => {
      const query: any = { _id: id, status: { $gt: BASE_STATUS.BS_UNKNOWN } };
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
  public fetchAll(): mongoose.QueryCursor<D> {
    this._logger.debug('Fetch all documents');
    const query: any = { status: { $gt: BASE_STATUS.BS_UNKNOWN } };
    return this._model.find(query).cursor();
  }

  /**
   * Delete and object
   */
  public delete(id: string): Promise<D> {
    this._logger.debug('Delete document', { id: id });
    return new Promise<D>((resolve, reject) => {
      const query: any = { _id: id, status: { $gt: BASE_STATUS.BS_UNKNOWN } };
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
}

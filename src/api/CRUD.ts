import mongoose from 'mongoose';
import { ERRORS } from '../types/errors';

export abstract class CRUD<T, D extends mongoose.Document>{
  protected _model: mongoose.Model<D>;

  constructor(model: mongoose.Model<D>) {
    this._model = model;
  }

  /**
   * Create new document object
   */
  public create(data: T): Promise<D> {
    return this._model.create(data);
  }

  /**
   * Update document object
   */
  public update(id: string, data: T): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      const update: any = { $set: data };
      this._model.findByIdAndUpdate(id, update, { new: true })
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
    return new Promise<D>((resolve, reject) => {
      this._model.findById(id)
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
    return this._model.find().cursor();
  }

  /**
   * Delete and object
   */
  public delete(id: string): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      const update: any = { $set: { status: -1 } };
      this._model.findByIdAndUpdate(id, update, { new: true })
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

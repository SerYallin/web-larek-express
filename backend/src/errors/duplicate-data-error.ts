import { IError } from '../types';

export class DuplicateDataError extends Error implements IError {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 409;
  }
}
export default DuplicateDataError;

import { IError } from '../types';

export class NotFoundError extends Error implements IError {
  public statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}
export default NotFoundError;
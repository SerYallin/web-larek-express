import { IError } from '../types';

export class ServerError extends Error implements IError {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 500;
  }
}
export default ServerError;

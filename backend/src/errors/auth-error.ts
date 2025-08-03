import { IError } from '../types';

export class AuthError extends Error implements IError {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}
export default AuthError;

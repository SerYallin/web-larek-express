import { IError } from '../types';

export class InputDataError extends Error implements IError {
  public statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}
export default InputDataError;
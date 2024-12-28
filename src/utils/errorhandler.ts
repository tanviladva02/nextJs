// errorhandler.ts
import { CustomError } from './customError'; 

export function throwError(message: string, statusCode: number, data?: unknown) {
  const error = new CustomError(message, statusCode, data);
  throw error;
}



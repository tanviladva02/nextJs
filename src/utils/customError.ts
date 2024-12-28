// CustomError.ts
export class CustomError extends Error {
    statusCode: number;
    data: unknown | null;  // 'data' is optional and can be unknown or null
  
    constructor(message: string, statusCode: number, data?: unknown) {
      super(message);
      this.statusCode = statusCode;
      this.data = data ?? null;  // Default to null if no data is provided
      this.name = this.constructor.name;  // Set the name to CustomError
      Error.captureStackTrace(this, this.constructor);  // Capture the stack trace for debugging
    }
  }
  

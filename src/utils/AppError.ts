export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
interface ErrorWithCode extends Error {
  code?: string;
}

export class CustomError extends Error {
  public readonly code?: string;
  public readonly name: string;
  public readonly details: any;

  constructor(err: ErrorWithCode) {
    super(err.message);
    this.details = err;
    this.code = err.code;
    this.name = 'GRPCCustomError';
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

import { ServiceError } from 'grpc';

export class UnknownServerError extends Error {
  public readonly code: number | undefined;
  public readonly name: string;
  public readonly details: any;

  constructor(err: ServiceError) {
    super(err.message);
    this.details = err;
    this.code = err.code;
    this.name = 'UnknowGRPCServerError';
    Object.setPrototypeOf(this, UnknownServerError.prototype);
  }
}

import * as grpc from 'grpc';

export class ClientError extends Error {
  [key: string]: any;
  grpcCode?: grpc.status;
}

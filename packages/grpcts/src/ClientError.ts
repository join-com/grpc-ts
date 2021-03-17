import * as grpc from '@grpc/grpc-js';

export class ClientError extends Error {
  [key: string]: any;
  grpcCode?: grpc.status;
  metadata?: grpc.Metadata;
}

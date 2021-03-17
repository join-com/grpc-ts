import * as grpc from '@grpc/grpc-js';

export interface Metadata {
  [key: string]: string;
}

export const toGRPCMetadata = (metadata: Metadata) => {
  const meta = new grpc.Metadata();
  Object.entries(metadata).forEach(([key, value]) => {
    meta.set(key, value);
  });
  return meta;
};

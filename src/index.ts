export { Client, Callback } from './Client';
export { Service, ErrorHandler } from './Service';
export { Server } from './Server';
import * as grpcOriginal from 'grpc';
export const grpc = grpcOriginal;

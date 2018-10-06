export { Client, Callback } from './Client';
export {
  Service,
  handleUnaryCallPromise,
  handleClientStreamingCallPromise,
  handleCall,
  Implementations
} from './Service';
export { Server } from './Server';
import * as grpcOriginal from 'grpc';
export const grpc = grpcOriginal;

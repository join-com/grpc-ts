import { Server, grpc } from '@join-com/grpc-ts';
import { MockService } from './mockService';

export class MockServer extends Server {
  constructor() {
    super(grpc.ServerCredentials.createInsecure());
  }

  public addMockService<T>(service: MockService<T>) {
    super.addService(service.service as any);
  }
}

import { Server, grpc } from '@join-com/grpc-ts';
import { MockService } from './MockService';

interface Services {
  [key: string]: MockService<any>;
}

export abstract class MockServer<T extends Services> extends Server {
  constructor(public readonly services: T) {
    super(grpc.ServerCredentials.createInsecure());
    Object.keys(services).forEach(key => {
      super.addService(services[key].service);
    });
  }
}

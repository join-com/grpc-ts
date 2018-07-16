import { Logger } from '@join-com/gcloud-logger';
import { logger as traceLogger } from '@join-com/gcloud-logger-trace';
import * as grpc from 'grpc';
import { Service } from './Service';

export class Server {
  public readonly server: grpc.Server;
  public port?: number;

  constructor(
    private readonly credentials: grpc.ServerCredentials,
    private readonly logger: Logger = traceLogger,
  ) {
    this.server = new grpc.Server();
  }

  public addService<T>(service: Service<T>) {
    this.server.addService(
      service.serviceDefinition,
      service.wrappedImplementations(),
    );
  }

  public async start(host: string) {
    const [hostName] = host.split(':');
    this.port = this.server.bind(host, this.credentials);
    if (this.port === 0) {
      throw Error(`Can not connect to host ${host}`);
    }
    this.logger.info(`grpc server is listening on ${hostName}:${this.port}`);
    this.server.start();
    return this.server;
  }

  public tryShutdown() {
    return new Promise(resolve => this.server.tryShutdown(resolve));
  }
}

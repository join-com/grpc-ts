import * as grpc from 'grpc';

export interface Service {
  serviceDefinition: grpc.ServiceDefinition<any>;
  implementations: grpc.UntypedServiceImplementation;
}

export interface Logger {
  info(message: string, payload?: any): void;
}

export class Server {
  public readonly server: grpc.Server;
  public port?: number;

  constructor(
    private readonly credentials: grpc.ServerCredentials = grpc.ServerCredentials.createInsecure(),
    private readonly logger?: Logger
  ) {
    this.server = new grpc.Server();
  }

  public addService(service: Service) {
    this.server.addService(service.serviceDefinition, service.implementations);
  }

  public async start(host: string) {
    const [hostName] = host.split(':');
    this.port = this.server.bind(host, this.credentials);
    if (this.port === 0) {
      throw Error(`Can not connect to host ${host}`);
    }
    if (this.logger) {
      this.logger.info(`grpc server is listening on ${hostName}:${this.port}`);
    }
    this.server.start();
    return this.server;
  }

  public tryShutdown() {
    return new Promise(resolve => this.server.tryShutdown(resolve));
  }
}

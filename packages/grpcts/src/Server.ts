import * as grpc from '@grpc/grpc-js';

export interface Service {
  serviceDefinition: grpc.ServiceDefinition<any>;
  implementations: grpc.UntypedServiceImplementation;
}

export interface Logger {
  info(message: string, payload?: any): void;
}

export async function bindServer(
  server: grpc.Server,
  host: string,
  credentials: grpc.ServerCredentials
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    server.bindAsync(host, credentials, (error, port) => {
      if (error) {
        reject(error);
      } else {
        resolve(port);
      }
    });
  });
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

    this.port = await bindServer(this.server, host, this.credentials)

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
    return new Promise<void>((resolve, reject) =>
      this.server.tryShutdown((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    );
  }
}

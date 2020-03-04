import * as grpc from 'grpc';
import { ClientError } from './ClientError';
import { toGRPCMetadata, Metadata } from './metadata';
import { ILatencyTimer, LatencyTimer, ILatency } from './LatencyTimer';

export interface ClientTrace {
  getTraceContext: () => string;
  getTraceContextName: () => string;
}

type GrpcClient = grpc.Client & { [implementation: string]: any };

export interface Logger {
  info(message: string, payload?: any): void;
}

export class Client {
  public client: GrpcClient;
  constructor(
    readonly definition: grpc.ServiceDefinition<any>,
    address: string,
    credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure(),
    public readonly trace?: ClientTrace,
    options?: object,
    private readonly logger?: Logger,
    private readonly latencyTimer: ILatencyTimer = new LatencyTimer()
  ) {
    const ClientClass = grpc.makeGenericClientConstructor(definition, '', {});
    this.client = new ClientClass(address, credentials, options) as GrpcClient;
  }

  public close() {
    this.client.close();
  }

  protected makeUnaryRequest<RequestType, ResponseType>(
    methodName: string,
    req: RequestType,
    metadata?: Metadata
  ): { call: grpc.ClientUnaryCall; res: Promise<ResponseType> } {
    let call: grpc.ClientUnaryCall | undefined;
    const latency = this.latencyTimer.start();
    const res = new Promise<ResponseType>((resolve, reject) => {
      call = this.client[methodName](
        req,
        this.metadata(metadata),
        (err: grpc.ServiceError, res: ResponseType) => {
          if (err) {
            return reject(this.convertError(err));
          }

          this.log(methodName, req, latency);
          resolve(res);
        }
      );
    });
    return { call: call!, res };
  }

  private log<RequestType>(
    method: string,
    req: RequestType,
    latency: ILatency
  ) {
    const path = this.definition[method].path;
    this.logger?.info(`GRPC ${path}`, {
      request: req,
      emitter: 'client',
      latency: latency.getValue(),
      path
    });
  }

  protected makeClientStreamRequest<RequestType, ResponseType>(
    methodName: string,
    metadata?: Metadata
  ) {
    let call: grpc.ClientWritableStream<RequestType> | undefined;
    const res = new Promise<ResponseType>((resolve, reject) => {
      call = this.client[methodName](
        this.metadata(metadata),
        (err: any, res: ResponseType) => {
          err ? reject(this.convertError(err)) : resolve(res);
        }
      );
    });
    return { call: call!, res };
  }

  protected makeServerStreamRequest<RequestType, ResponseType>(
    methodName: string,
    req: RequestType,
    metadata?: Metadata
  ) {
    const call: grpc.ClientReadableStream<ResponseType> = this.client[
      methodName
    ](req, this.metadata(metadata));
    return { call };
  }

  protected makeBidiStreamRequest<RequestType, ResponseType>(
    methodName: string,
    metadata?: Metadata
  ) {
    const call: grpc.ClientDuplexStream<
      RequestType,
      ResponseType
    > = this.client[methodName](this.metadata(metadata));
    return { call };
  }

  protected assignError(
    metadata: grpc.Metadata,
    errorJSON: any,
    code?: grpc.status
  ) {
    const error = new ClientError();
    Object.assign(error, {
      ...errorJSON,
      grpcCode: code,
      metadata: metadata
    });
    return error;
  }

  protected handleMetaError(metadata: grpc.Metadata, code?: grpc.status) {
    const metadataError = metadata.get('error'); // deprecated, remove in next version
    const metadataBinaryError = metadata.get('error-bin');
    if (!metadataError.length && !metadataBinaryError.length) {
      return;
    }
    const errorJSON = JSON.parse(
      metadataBinaryError.length
        ? metadataBinaryError[0].toString()
        : (metadataError[0] as string)
    );
    return this.assignError(metadata, errorJSON, code);
  }

  protected convertError(err: grpc.ServiceError) {
    const { metadata } = err;
    if (metadata) {
      const error = this.handleMetaError(metadata, err.code);
      if (error) return error;
    }
    return Object.assign(err, { grpcCode: err.code });
  }

  private metadata(attrs?: Metadata) {
    const grpcMetadata = attrs ? toGRPCMetadata(attrs) : new grpc.Metadata();
    if (this.trace) {
      return this.addTraceMetadata(this.trace, grpcMetadata);
    }
    return grpcMetadata;
  }

  private addTraceMetadata(trace: ClientTrace, grpcMetadata: grpc.Metadata) {
    const traceId = trace.getTraceContext();
    if (traceId) {
      grpcMetadata.add(trace.getTraceContextName(), trace.getTraceContext());
    }
    return grpcMetadata;
  }
}

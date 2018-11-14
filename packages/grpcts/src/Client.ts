import * as grpc from 'grpc';
import { ClientError } from './ClientError';
import { toGRPCMetadata, Metadata } from './metadata';

export interface ClientTrace {
  getTraceContext: () => string;
  getTraceContextName: () => string;
}

type GrpcClient = grpc.Client & { [implementation: string]: any };

export class Client {
  public client: GrpcClient;
  constructor(
    definition: grpc.ServiceDefinition<any>,
    address: string,
    credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure(),
    public readonly trace?: ClientTrace,
    options?: object
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
    const res = new Promise<ResponseType>((resolve, reject) => {
      call = this.client[methodName](
        req,
        this.metadata(metadata),
        (err: grpc.ServiceError, res: ResponseType) => {
          err ? reject(this.convertError(err)) : resolve(res);
        }
      );
    });
    return { call: call!, res };
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

  protected convertError(err: grpc.ServiceError) {
    const { metadata } = err;
    if (metadata) {
      const metadataError = metadata.get('error');
      if (metadataError && metadataError.length > 0) {
        const errorJSON = JSON.parse(metadataError[0] as string);
        const error = new ClientError();
        Object.assign(error, {
          ...errorJSON,
          grpcCode: err.code,
          metadata: err.metadata
        });
        return error;
      }
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

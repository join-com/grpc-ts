// import * as trace from '@join-com/node-trace';
import * as grpc from 'grpc';
import { ClientError } from './ClientError';

type GrpcClient = grpc.Client & { [implementation: string]: any };

export class Client {
  public client: GrpcClient;
  constructor(
    definition: grpc.ServiceDefinition<any>,
    address: string,
    credentials: grpc.ChannelCredentials,
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
    req: RequestType
  ): { call: grpc.ClientUnaryCall; res: Promise<ResponseType> } {
    let call: grpc.ClientUnaryCall | undefined;
    const res = new Promise<ResponseType>((resolve, reject) => {
      call = this.client[methodName](
        req,
        (err: grpc.ServiceError, res: ResponseType) => {
          err ? reject(this.convertError(err)) : resolve(res);
        }
      );
    });
    return { call: call!, res };
  }

  protected makeClientStreamRequest<RequestType, ResponseType>(
    methodName: string
  ) {
    let call: grpc.ClientWritableStream<RequestType> | undefined;
    const res = new Promise<ResponseType>((resolve, reject) => {
      call = this.client[methodName]((err: any, res: ResponseType) => {
        err ? reject(this.convertError(err)) : resolve(res);
      });
    });
    return { call: call!, res };
  }

  protected makeServerStreamRequest<RequestType, ResponseType>(
    methodName: string,
    req: RequestType
  ) {
    const call: grpc.ClientReadableStream<ResponseType> = this.client[
      methodName
    ](req);
    return { call };
  }

  protected makeBidiStreamRequest<RequestType, ResponseType>(
    methodName: string
  ) {
    const call: grpc.ClientDuplexStream<
      RequestType,
      ResponseType
    > = this.client[methodName]();
    return { call };
  }

  protected convertError(err: grpc.ServiceError) {
    const { metadata } = err;
    if (metadata) {
      const metadataError = metadata.get('error');
      if (metadataError && metadataError.length > 0) {
        const errorJSON = JSON.parse(metadataError[0] as string);
        const error = new ClientError();
        Object.assign(error, { ...errorJSON, grpcCode: err.code });
        return error;
      }
    }
    return Object.assign(err, { grpcCode: err.code });
  }
}

// export interface Response {
//   error?: Error;
//   result: any;
// }

// export type Callback<T> = (error?: Error, result?: T) => void;

// const responseHandler = (
//   resolve: (value?: {} | PromiseLike<{}> | undefined) => void,
//   reject: (reason?: any) => void,
// ) => {
//   return (err: Error, response: Response) => {
//     if (err) {
//       reject(new UnknownServerError(err));
//     } else if (response.error) {
//       reject(new CustomError(response.error));
//     } else {
//       resolve(response.result);
//     }
//   };
// };

// const originCallback = <T>(callback: Callback<T>) => (
//   err: Error,
//   response: Response,
// ) => {
//   if (err) {
//     callback(new UnknownServerError(err));
//   } else if (response.error) {
//     callback(new CustomError(response.error));
//   } else {
//     callback(undefined, response.result);
//   }
// };

// export class Client {
//   private client: any;

//   constructor(
//     protoPath: string,
//     includeDirs: string[],
//     packageName: string,
//     serviceName: string,
//     host: string,
//     credentials: grpc.ChannelCredentials,
//   ) {
//     const packageDefinition = loadService(protoPath, includeDirs);
//     const definition = packageName
//       .split('.')
//       .reduce((acc, val) => acc[val], packageDefinition);
//     const Service = definition[serviceName];
//     this.client = new Service(host, credentials);
//   }

//   public close() {
//     return grpc.closeClient(this.client);
//   }

//   protected makeServerStreamRequest(fnName: string, attrs = {}) {
//     return this.client[fnName](attrs, this.traceMetadata);
//   }

//   protected makeBidiStreamRequest(fnName: string) {
//     return this.client[fnName](this.traceMetadata);
//   }

//   protected makeClientStreamRequest<ResponseType>(
//     fnName: string,
//     callback: Callback<ResponseType>,
//   ) {
//     return this.client[fnName](this.traceMetadata, originCallback(callback));
//   }

//   protected makeUnaryRequest(fnName: string, attrs = {}): Promise<any> {
//     return new Promise((resolve, reject) =>
//       this.client[fnName](
//         attrs,
//         this.traceMetadata,
//         responseHandler(resolve, reject),
//       ),
//     );
//   }

//   private get traceMetadata() {
//     const metadata = new grpc.Metadata();
//     const traceId = trace.getTraceContext();
//     if (traceId) {
//       metadata.add(trace.getTraceContextName(), trace.getTraceContext());
//     }
//     return metadata;
//   }
// }

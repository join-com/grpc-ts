import * as trace from '@join-com/node-trace';
import * as grpc from 'grpc';
import { CustomError } from './CustomError';
import { loadService } from './protoLoader';
import { UnknownServerError } from './UnknownServerError';

export interface Response {
  error?: Error;
  result: any;
}

export type Callback<T> = (error?: Error, result?: T) => void;

const responseHandler = (
  resolve: (value?: {} | PromiseLike<{}> | undefined) => void,
  reject: (reason?: any) => void,
) => {
  return (err: Error, response: Response) => {
    if (err) {
      reject(new UnknownServerError(err));
    } else if (response.error) {
      reject(new CustomError(response.error));
    } else {
      resolve(response.result);
    }
  };
};

const originCallback = <T>(callback: Callback<T>) => (
  err: Error,
  response: Response,
) => {
  if (err) {
    callback(new UnknownServerError(err));
  } else if (response.error) {
    callback(new CustomError(response.error));
  } else {
    callback(undefined, response.result);
  }
};

export class Client {
  private client: any;

  constructor(
    protoPath: string,
    packageName: string,
    serviceName: string,
    host: string,
    credentials: grpc.ChannelCredentials,
  ) {
    const packageDefinition = loadService(protoPath);
    const Service = packageDefinition[packageName][serviceName];
    this.client = new Service(host, credentials);
  }

  public close() {
    return grpc.closeClient(this.client);
  }

  protected makeServerStreamRequest(fnName: string, attrs = {}) {
    return this.client[fnName](attrs, this.traceMetadata);
  }

  protected makeBidiStreamRequest(fnName: string) {
    return this.client[fnName](this.traceMetadata);
  }

  protected makeClientStreamRequest<ResponseType>(
    fnName: string,
    callback: Callback<ResponseType>,
  ) {
    return this.client[fnName](this.traceMetadata, originCallback(callback));
  }

  protected makeUnaryRequest(fnName: string, attrs = {}): Promise<any> {
    return new Promise((resolve, reject) =>
      this.client[fnName](
        attrs,
        this.traceMetadata,
        responseHandler(resolve, reject),
      ),
    );
  }

  private get traceMetadata() {
    const metadata = new grpc.Metadata();
    const traceId = trace.getTraceContext();
    if (traceId) {
      metadata.add(trace.getTraceContextName(), trace.getTraceContext());
    }
    return metadata;
  }
}

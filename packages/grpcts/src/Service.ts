import * as grpc from 'grpc';
import { ILatency, ILatencyTimer, LatencyTimer } from './LatencyTimer';

export type handleUnaryCallPromise<RequestType, ResponseType> = (
  call: grpc.ServerUnaryCall<RequestType>
) => Promise<ResponseType>;

export type handleClientStreamingCallPromise<RequestType, ResponseType> = (
  call: grpc.ServerReadableStream<RequestType>
) => Promise<ResponseType>;

export type handleCall<RequestType, ResponseType> =
  | grpc.handleCall<RequestType, ResponseType>
  | handleUnaryCallPromise<RequestType, ResponseType>
  | handleClientStreamingCallPromise<RequestType, ResponseType>;

export interface Implementations {
  [key: string]: handleCall<any, any>;
}

export interface Logger {
  info(message: string, payload?: any): void;
}

export interface Trace {
  getTraceContextName: () => string;
  start: (traceId?: string) => void;
}

function replacer(key: string, value: any) {
  if (key === 'stack') {
    return;
  }
  if (value instanceof Error) {
    const error = Object.getOwnPropertyNames(value).reduce(
      (acc, key: string) => ({ ...acc, [key]: (value as any)[key] }),
      {}
    );
    return error;
  }
  return value;
}

const handleError = (e: Error, callback: grpc.sendUnaryData<any>) => {
  const metadata = new grpc.Metadata();
  metadata.set('error-bin', Buffer.from(JSON.stringify(e, replacer)));
  callback(
    {
      code: grpc.status.UNKNOWN,
      metadata
    } as any,
    {}
  );
};

const logging = (
  logger: Logger,
  definition: grpc.MethodDefinition<any, any>,
  call: any,
  result?: any,
  latency?: ILatency
) => {
  const request = !definition.requestStream ? call.request : 'STREAM';
  const response = !definition.responseStream ? result : 'STREAM';
  const isError = result instanceof Error;
  const logData = {
    request,
    [isError ? 'error' : 'response']: response,
    path: definition.path,
    emitter: 'service'
  };

  if (latency) {
    logData.latency = latency.getValue();
  }

  logger.info(`GRPC ${logData.path}`, logData);
};

const otherImplementation = <T>(
  implementation: handleCall<any, any>,
  definition: grpc.MethodDefinition<any, any>,
  logger?: Logger
) => async (call: T, ...args: any[]) => {
  if (logger) {
    logging(logger, definition, call);
  }

  (implementation as any)(call, ...args);
};

const callbackImplementation = <T>(
  implementation: handleCall<any, any>,
  definition: grpc.MethodDefinition<any, any>,
  latencyTimer: ILatencyTimer,
  logger?: Logger
) => async (call: T, callback: grpc.sendUnaryData<any>) => {
  const latency = latencyTimer.start();
  const callbackWrap = (err: any, result: any) => {
    if (logger) {
      logging(logger, definition, call, result, latency);
    }
    callback(err, result);
  };
  (implementation as any)(call, callbackWrap);
};

const promiseImplementation = <T>(
  implementation: handleCall<any, any>,
  definition: grpc.MethodDefinition<any, any>,
  latencyTimer: ILatencyTimer,
  logger?: Logger
) => async (call: T, callback: grpc.sendUnaryData<any>) => {
  const latency = latencyTimer.start();
  try {
    const result = await (implementation as any)(call);

    if (logger) {
      logging(logger, definition, call, result, latency);
    }

    callback(null, result);
  } catch (e) {
    if (logger) {
      logging(logger, definition, call, e, latency);
    }
    handleError(e, callback);
  }
};

const wrapImplementationWithTrace = (
  implementation: handleCall<any, any>,
  trace: Trace
) => (call: any, ...args: any[]) => {
  const traceId = call.metadata.get(trace.getTraceContextName());
  if (traceId) {
    trace.start(traceId.join());
  }
  return (implementation as any)(call, ...args);
};

export class Service<I extends Implementations> {
  public readonly implementations: grpc.UntypedServiceImplementation;
  constructor(
    public readonly serviceDefinition: grpc.ServiceDefinition<any>,
    public readonly rawImplementations: I,
    private readonly logger?: Logger,
    private readonly trace?: Trace,
    private readonly latencyTimer: ILatencyTimer = new LatencyTimer()
  ) {
    this.implementations = this.convertToGrpcImplementation(
      this.rawImplementations
    );
  }

  private convertToGrpcImplementation(
    implementations: I
  ): grpc.UntypedServiceImplementation {
    return Object.entries(implementations).reduce(
      (acc, [name, implementation]) => {
        let newImplementation: handleCall<any, any>;

        const isClientStream =
          !this.serviceDefinition[name].responseStream &&
          this.serviceDefinition[name].requestStream;

        const isUnary =
          !this.serviceDefinition[name].responseStream &&
          !this.serviceDefinition[name].requestStream;

        const hasCallback = implementation.length === 2;

        if ((isClientStream || isUnary) && !hasCallback) {
          newImplementation = promiseImplementation<any>(
            implementation,
            this.serviceDefinition[name],
            this.latencyTimer,
            this.logger
          );
        } else if (!this.serviceDefinition[name].responseStream) {
          newImplementation = callbackImplementation<any>(
            implementation,
            this.serviceDefinition[name],
            this.latencyTimer,
            this.logger
          );
        } else {
          newImplementation = otherImplementation<any>(
            implementation,
            this.serviceDefinition[name],
            this.logger
          );
        }
        return {
          ...acc,
          [name]: this.trace
            ? wrapImplementationWithTrace(newImplementation, this.trace)
            : newImplementation
        };
      },
      {}
    ) as grpc.UntypedServiceImplementation;
  }
}

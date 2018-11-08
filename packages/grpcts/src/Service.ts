import * as grpc from 'grpc';

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
  metadata.set('error', JSON.stringify(e, replacer));
  callback(
    {
      code: grpc.status.UNKNOWN,
      metadata
    } as any,
    {}
  );
};

const wrapDefinition = (
  definition: grpc.MethodDefinition<any, any>,
  logger: Logger
): grpc.MethodDefinition<any, any> => ({
  ...definition,
  requestDeserialize: argBuf => {
    const request = definition.requestDeserialize(argBuf);
    logger.info(`GRPC request ${definition.path}`, request);
    return request;
  },
  responseSerialize: args => {
    logger.info(`GRPC response ${definition.path}`, args);
    return definition.responseSerialize(args);
  }
});

const promiseImplementation = <T>(
  implementation: handleCall<any, any>
) => async (call: T, callback: grpc.sendUnaryData<any>) => {
  try {
    const result = await (implementation as any)(call);
    callback(null, result);
  } catch (e) {
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
  public readonly serviceDefinition: grpc.ServiceDefinition<any>;
  public readonly implementations: grpc.UntypedServiceImplementation;
  constructor(
    rawDefinitions: grpc.ServiceDefinition<any>,
    public readonly rawImplementations: I,
    private readonly logger?: Logger,
    private readonly trace?: Trace
  ) {
    this.serviceDefinition = this.addLogging(rawDefinitions);
    this.implementations = this.convertToGrpcImplementation(
      this.rawImplementations
    );
  }

  private addLogging(definitions: grpc.ServiceDefinition<any>) {
    const entries = Object.entries<grpc.MethodDefinition<any, any>>(
      definitions
    );
    if (!this.logger) {
      return definitions;
    }
    const loggedDefinitions = entries.reduce((acc, [name, definition]) => {
      const loggedDefinition: grpc.MethodDefinition<any, any> = wrapDefinition(
        definition,
        this.logger!
      );
      return { ...acc, [name]: loggedDefinition };
    }, {}) as grpc.ServiceDefinition<any>;
    return loggedDefinitions;
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

        if (isClientStream && !hasCallback) {
          newImplementation = promiseImplementation<
            grpc.ServerReadableStream<any>
          >(implementation);
        } else if (isUnary && !hasCallback) {
          newImplementation = promiseImplementation<grpc.ServerUnaryCall<any>>(
            implementation
          );
        } else {
          newImplementation = implementation;
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

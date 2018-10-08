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

const handleError = (e: Error, callback: grpc.sendUnaryData<any>) => {
  const metadata = new grpc.Metadata();
  metadata.set(
    'error',
    JSON.stringify(
      e,
      Object.getOwnPropertyNames(e).filter(prop => prop !== 'stack')
    )
  );
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
  public readonly definitions: grpc.ServiceDefinition<any>;
  public readonly grpcImplementations: grpc.UntypedServiceImplementation;
  constructor(
    rawDefinitions: grpc.ServiceDefinition<any>,
    public readonly implementations: I,
    private readonly logger?: Logger,
    private readonly trace?: Trace
  ) {
    this.definitions = this.addLogging(rawDefinitions);
    this.grpcImplementations = this.convertToGrpcImplementation(
      this.implementations
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
          !this.definitions[name].responseStream &&
          this.definitions[name].requestStream;

        const isUnary =
          !this.definitions[name].responseStream &&
          !this.definitions[name].requestStream;

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

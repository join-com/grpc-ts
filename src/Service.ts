import { Level, logger } from '@join-com/gcloud-logger-trace';
import * as trace from '@join-com/node-trace';
import * as grpc from 'grpc';
import { Readable, Writable } from 'stream';
import { loadService } from './protoLoader';

export type ErrorHandler = (
  error: Error,
  callback: grpc.sendUnaryData<any>,
) => void;

export type ImplementationFunction = (req: any, stream?: any) => Promise<any>;

export interface IGRPCImplementations {
  [name: string]: grpc.handleUnaryCall<any, any>;
}

export interface IService {
  name: string;
  wrappedImplementations(): IGRPCImplementations;
}

export interface NotFoundError extends Error {
  code: number;
}

export const baseErrorHandler: ErrorHandler = (
  error: Error | NotFoundError,
  callback: grpc.sendUnaryData<any>,
) => {
  if ((error as NotFoundError).code === 404) {
    callback(null, { error });
    return;
  }
  const err: grpc.ServiceError = new Error(error.message);
  err.code = grpc.status.UNKNOWN;
  callback(err, {});
};

type ServerCall =
  | grpc.ServerUnaryCall<any>
  | grpc.ServerWriteableStream<any>
  | grpc.ServerDuplexStream<any, any>
  | grpc.ServerReadableStream<any>;

const isDuplexStream = (call: ServerCall) =>
  call instanceof Writable && call instanceof Readable;

const isServerStream = (call: ServerCall) => call instanceof Writable;

const isClientStream = (call: ServerCall) => call instanceof Readable;

const duplex = (
  name: string,
  implementation: ImplementationFunction,
  call: grpc.ServerDuplexStream<any, any>,
) => {
  logger.info(`GRPC ${name} bidi stream call`);
  return implementation(call);
};

const serverStream = (
  name: string,
  implementation: ImplementationFunction,
  call: grpc.ServerWriteableStream<any>,
) => {
  logger.info(`GRPC ${name} server stream call`, { request: call.request });
  return implementation(call.request, call);
};

const clientStream = async (
  name: string,
  implementation: ImplementationFunction,
  call: grpc.ServerReadableStream<any>,
  callback: grpc.sendUnaryData<any>,
  errorHandler: ErrorHandler,
) => {
  try {
    const value = await implementation(call);
    logger.info(`GRPC ${name} client stream call`, { response: value });
    return callback(null, { result: value });
  } catch (e) {
    logger.info(`GRPC ${name}`, { error: e });
    return errorHandler(e, callback);
  }
};

const unary = async (
  name: string,
  implementation: ImplementationFunction,
  call: grpc.ServerUnaryCall<any>,
  callback: grpc.sendUnaryData<any>,
  errorHandler: ErrorHandler,
) => {
  try {
    const value = await implementation(call.request);
    const level = name === 'check' ? Level.DEBUG : Level.INFO;
    logger.log(level, `GRPC ${name}`, {
      request: call.request,
      response: value,
    });
    if (!value) {
      return callback(null, {});
    }

    return callback(null, { result: value });
  } catch (e) {
    logger.info(`GRPC ${name}`, { request: call.request, error: e });
    return errorHandler(e, callback);
  }
};

const wrapImplementation = (
  name: string,
  implementation: ImplementationFunction,
  errorHandler: ErrorHandler,
): grpc.handleUnaryCall<any, any> => async (
  call: ServerCall,
  callback: grpc.sendUnaryData<any>,
) => {
  const traceId = call.metadata.get(trace.getTraceContextName());
  if (traceId) {
    trace.start(traceId.join());
  }

  if (isDuplexStream(call)) {
    return duplex(name, implementation, call as any);
  } else if (isServerStream(call)) {
    return serverStream(name, implementation, call as any);
  } else if (isClientStream(call)) {
    return clientStream(
      name,
      implementation,
      call as any,
      callback,
      errorHandler,
    );
  } else {
    return unary(name, implementation, call as any, callback, errorHandler);
  }
};

export class Service<T> {
  public readonly serviceDefinition: grpc.ServiceDefinition<any>;
  private readonly implementations: T;
  constructor(
    protoPath: string,
    includeDirs: string[],
    packageName: string,
    serviceName: string,
    implementations: T,
    private readonly errorHandler: ErrorHandler = baseErrorHandler,
  ) {
    const packageDefinition = loadService(protoPath, includeDirs);
    this.implementations = implementations;
    const definition = packageName
      .split('.')
      .reduce((acc, val) => acc[val], packageDefinition);
    this.serviceDefinition = definition[serviceName].service;
  }

  public wrappedImplementations(): grpc.UntypedServiceImplementation {
    const wrapped = Object.keys(this.implementations).reduce(
      (acc, key) => ({
        ...acc,
        [key]: wrapImplementation(
          key,
          (this.implementations as any)[key],
          this.errorHandler,
        ),
      }),
      {},
    );
    return wrapped;
  }
}

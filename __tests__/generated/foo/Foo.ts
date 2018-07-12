// GENERATED CODE -- DO NOT EDIT!
import { FooCommon } from '../common/Common';

import * as grpc from 'grpc';
import * as grpcTs from '../../../src/index';
import * as path from 'path';

export namespace FooTest {
  export interface FieldError {
    field: string;
    message: string;
    code: string;
  }

  export interface Error {
    code: number;
    message: string;
    fieldErrors?: FooTest.FieldError[];
  }

  export interface FooRequest {
    id: number;
    name?: string;
    password?: string;
    token?: string;
    empty?: FooCommon.EmptyMessage;
  }

  export interface StreamBarResponse {
    result: string;
  }

  export interface BarResponse {
    error?: FooTest.Error;
    result: string;
  }

  export interface TestSvcImplementation {
    foo(req: FooTest.FooRequest): Promise<string>;
    fooServerStream(
      req: FooTest.FooRequest,
      stream: grpc.ServerWriteableStream<FooTest.StreamBarResponse>,
    ): void;
    fooClientStream(
      stream: grpc.ServerReadableStream<FooTest.FooRequest>,
    ): Promise<string>;
    fooBieStream(
      duplexStream: grpc.ServerDuplexStream<
        FooTest.FooRequest,
        FooTest.StreamBarResponse
      >,
    ): void;
  }

  export class TestSvcService extends grpcTs.Service<TestSvcImplementation> {
    constructor(
      implementations: TestSvcImplementation,
      errorHandler?: grpcTs.ErrorHandler,
    ) {
      const protoPath = 'foo/foo.proto';
      const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
      super(
        protoPath,
        includeDirs,
        'foo.test',
        'TestSvc',
        implementations,
        errorHandler,
      );
    }
  }

  export class TestSvcClient extends grpcTs.Client {
    constructor(host: string, credentials: grpc.ChannelCredentials) {
      const protoPath = 'foo/foo.proto';
      const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
      super(protoPath, includeDirs, 'foo.test', 'TestSvc', host, credentials);
    }
    public foo(req: FooTest.FooRequest): Promise<string> {
      return super.makeUnaryRequest('foo', req);
    }
    public fooServerStream(
      req: FooTest.FooRequest,
    ): grpc.ClientReadableStream<FooTest.StreamBarResponse> {
      return super.makeServerStreamRequest('fooServerStream', req);
    }
    public fooClientStream(
      callback: grpcTs.Callback<FooTest.BarResponse>,
    ): grpc.ClientWritableStream<FooTest.FooRequest> {
      return super.makeClientStreamRequest('fooClientStream', callback);
    }
    public fooBieStream(): grpc.ClientDuplexStream<
      FooTest.FooRequest,
      FooTest.StreamBarResponse
    > {
      return super.makeBidiStreamRequest('fooBieStream');
    }
  }
}

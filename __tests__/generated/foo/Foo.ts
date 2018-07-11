// GENERATED CODE -- DO NOT EDIT!
import { FooCommon } from '../common/Common';

import * as grpc from 'grpc';
import * as grpcTs from '../../../src/index';
import * as path from 'path';

export namespace Foo {
  export interface FieldError {
    field: string;
    message: string;
    code: string;
  }

  export interface Error {
    code: number;
    message: string;
    fieldErrors?: Foo.FieldError[];
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
    error?: Foo.Error;
    result: string;
  }

  export interface TestSvcImplementation {
    foo(req: Foo.FooRequest): Promise<string>;
    fooServerStream(
      req: Foo.FooRequest,
      stream: grpc.ServerWriteableStream<Foo.StreamBarResponse>,
    ): void;
    fooClientStream(
      stream: grpc.ServerReadableStream<Foo.FooRequest>,
    ): Promise<string>;
    fooBieStream(
      duplexStream: grpc.ServerDuplexStream<
        Foo.FooRequest,
        Foo.StreamBarResponse
      >,
    ): void;
  }

  export class TestSvcService extends grpcTs.Service<TestSvcImplementation> {
    constructor(implementations: TestSvcImplementation) {
      const protoPath = 'foo/foo.proto';
      const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
      super(protoPath, includeDirs, 'foo', 'TestSvc', implementations);
    }
  }

  export class TestSvcClient extends grpcTs.Client {
    constructor(host: string, credentials: grpc.ChannelCredentials) {
      const protoPath = 'foo/foo.proto';
      const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
      super(protoPath, includeDirs, 'foo', 'TestSvc', host, credentials);
    }
    public foo(req: Foo.FooRequest): Promise<string> {
      return super.makeUnaryRequest('foo', req);
    }
    public fooServerStream(
      req: Foo.FooRequest,
    ): grpc.ClientReadableStream<Foo.StreamBarResponse> {
      return super.makeServerStreamRequest('fooServerStream', req);
    }
    public fooClientStream(
      callback: grpcTs.Callback<Foo.BarResponse>,
    ): grpc.ClientWritableStream<Foo.FooRequest> {
      return super.makeClientStreamRequest('fooClientStream', callback);
    }
    public fooBieStream(): grpc.ClientDuplexStream<
      Foo.FooRequest,
      Foo.StreamBarResponse
    > {
      return super.makeBidiStreamRequest('fooBieStream');
    }
  }
}

// GENERATED CODE -- DO NOT EDIT!
import { FooCommon } from '../common/Common';
import * as protobufjs from 'protobufjs/minimal';
// @ts-ignore ignored as it's generated and it's difficult to predict if logger is needed
import { logger } from '@join-com/gcloud-logger-trace';

import * as grpcts from '../../../src';
import * as nodeTrace from '@join-com/node-trace';

export namespace FooTest {
  export interface IFooRequest {
    id?: number;
    name?: string[];
    password?: string;
    token?: string;
    empty?: FooCommon.IEmptyMessage;
  }

  export class FooRequest implements IFooRequest {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new FooRequest();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.id = reader.int32();
            break;
          case 2:
            if (!(message.name && message.name.length)) {
              message.name = [];
            }
            message.name.push(reader.string());
            break;
          case 3:
            message.password = reader.string();
            break;
          case 4:
            message.token = reader.string();
            break;
          case 5:
            message.empty = FooCommon.EmptyMessage.decode(
              reader,
              reader.uint32()
            );
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
    public id?: number;
    public name?: string[];
    public password?: string;
    public token?: string;
    public empty?: FooCommon.IEmptyMessage;
    constructor(attrs?: IFooRequest) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.id != null) {
        writer.uint32(8).int32(this.id);
      }
      if (this.name != null) {
        for (const value of this.name) {
          writer.uint32(18).string(value);
        }
      }
      if (this.password != null) {
        writer.uint32(26).string(this.password);
      }
      if (this.token != null) {
        writer.uint32(34).string(this.token);
      }
      if (this.empty != null) {
        const msg = new FooCommon.EmptyMessage(this.empty);
        msg.encode(writer.uint32(42).fork()).ldelim();
      }
      return writer;
    }
  }

  export interface IStreamBarResponse {
    result?: string;
  }

  export class StreamBarResponse implements IStreamBarResponse {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new StreamBarResponse();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.result = reader.string();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
    public result?: string;
    constructor(attrs?: IStreamBarResponse) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.result != null) {
        writer.uint32(10).string(this.result);
      }
      return writer;
    }
  }

  export interface IBarResponse {
    result?: string;
  }

  export class BarResponse implements IBarResponse {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new BarResponse();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 2:
            message.result = reader.string();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
    public result?: string;
    constructor(attrs?: IBarResponse) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.result != null) {
        writer.uint32(18).string(this.result);
      }
      return writer;
    }
  }

  export const testSvcServiceDefinition = {
    foo: {
      path: '/TestSvc/Foo',
      requestStream: false,
      responseStream: false,
      requestType: FooRequest,
      responseType: BarResponse,
      requestSerialize: (args: IFooRequest) =>
        new FooRequest(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequest.decode(argBuf),
      responseSerialize: (args: IBarResponse) =>
        new BarResponse(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => BarResponse.decode(argBuf)
    },
    fooServerStream: {
      path: '/TestSvc/FooServerStream',
      requestStream: false,
      responseStream: true,
      requestType: FooRequest,
      responseType: StreamBarResponse,
      requestSerialize: (args: IFooRequest) =>
        new FooRequest(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequest.decode(argBuf),
      responseSerialize: (args: IStreamBarResponse) =>
        new StreamBarResponse(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => StreamBarResponse.decode(argBuf)
    },
    fooClientStream: {
      path: '/TestSvc/FooClientStream',
      requestStream: true,
      responseStream: false,
      requestType: FooRequest,
      responseType: BarResponse,
      requestSerialize: (args: IFooRequest) =>
        new FooRequest(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequest.decode(argBuf),
      responseSerialize: (args: IBarResponse) =>
        new BarResponse(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => BarResponse.decode(argBuf)
    },
    fooBidiStream: {
      path: '/TestSvc/FooBidiStream',
      requestStream: true,
      responseStream: true,
      requestType: FooRequest,
      responseType: StreamBarResponse,
      requestSerialize: (args: IFooRequest) =>
        new FooRequest(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequest.decode(argBuf),
      responseSerialize: (args: IStreamBarResponse) =>
        new StreamBarResponse(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => StreamBarResponse.decode(argBuf)
    }
  };

  export interface ITestSvcImplementation extends grpcts.Implementations {
    foo(call: grpcts.grpc.ServerUnaryCall<IFooRequest>): Promise<IBarResponse>;
    foo(
      call: grpcts.grpc.ServerUnaryCall<IFooRequest>,
      callback: grpcts.grpc.sendUnaryData<IBarResponse>
    ): void;
    fooServerStream(call: grpcts.grpc.ServerWriteableStream<IFooRequest>): void;
    fooClientStream(
      call: grpcts.grpc.ServerReadableStream<IFooRequest>
    ): Promise<IBarResponse>;
    fooClientStream(
      call: grpcts.grpc.ServerReadableStream<IFooRequest>,
      callback: grpcts.grpc.sendUnaryData<IBarResponse>
    ): void;
    fooBidiStream(
      call: grpcts.grpc.ServerDuplexStream<IFooRequest, IStreamBarResponse>
    ): void;
  }

  export class TestSvcClient extends grpcts.Client {
    constructor(
      address: string,
      credentials?: grpcts.grpc.ChannelCredentials,
      trace: grpcts.ClientTrace = nodeTrace,
      options?: object
    ) {
      super(testSvcServiceDefinition, address, credentials, trace, options);
    }
    public foo(req: IFooRequest, metadata?: grpcts.Metadata) {
      return super.makeUnaryRequest<IFooRequest, IBarResponse>(
        'foo',
        req,
        metadata
      );
    }
    public fooServerStream(req: IFooRequest, metadata?: grpcts.Metadata) {
      return super.makeServerStreamRequest<IFooRequest, IStreamBarResponse>(
        'fooServerStream',
        req,
        metadata
      );
    }
    public fooClientStream(metadata?: grpcts.Metadata) {
      return super.makeClientStreamRequest<IFooRequest, IBarResponse>(
        'fooClientStream',
        metadata
      );
    }
    public fooBidiStream(metadata?: grpcts.Metadata) {
      return super.makeBidiStreamRequest<IFooRequest, IStreamBarResponse>(
        'fooBidiStream',
        metadata
      );
    }
  }
}

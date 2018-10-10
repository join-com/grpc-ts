// GENERATED CODE -- DO NOT EDIT!
import { FooCommon } from '../common/Common';
import * as protobufjs from 'protobufjs/minimal';

import * as grpc from 'grpc';
import * as grpcts from '../../../src';

export namespace FooTest {
  export interface FooRequest {
    id?: number;
    name?: string[];
    password?: string;
    token?: string;
    empty?: FooCommon.EmptyMessage;
  }

  export class FooRequestMsg implements FooRequest {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new FooRequestMsg();
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
            message.empty = FooCommon.EmptyMessageMsg.decode(
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
    public empty?: FooCommon.EmptyMessage;
    constructor(attrs?: FooRequest) {
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
        const msg = new FooCommon.EmptyMessageMsg(this.empty);
        msg.encode(writer.uint32(42).fork()).ldelim();
      }
      return writer;
    }
  }

  export interface StreamBarResponse {
    result?: string;
  }

  export class StreamBarResponseMsg implements StreamBarResponse {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new StreamBarResponseMsg();
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
    constructor(attrs?: StreamBarResponse) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.result != null) {
        writer.uint32(10).string(this.result);
      }
      return writer;
    }
  }

  export interface BarResponse {
    result?: string;
  }

  export class BarResponseMsg implements BarResponse {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new BarResponseMsg();
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
    constructor(attrs?: BarResponse) {
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
      requestType: FooRequestMsg,
      responseType: BarResponseMsg,
      requestSerialize: (args: FooRequest) =>
        new FooRequestMsg(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
      responseSerialize: (args: BarResponse) =>
        new BarResponseMsg(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => BarResponseMsg.decode(argBuf)
    },
    fooServerStream: {
      path: '/TestSvc/FooServerStream',
      requestStream: false,
      responseStream: true,
      requestType: FooRequestMsg,
      responseType: StreamBarResponseMsg,
      requestSerialize: (args: FooRequest) =>
        new FooRequestMsg(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
      responseSerialize: (args: StreamBarResponse) =>
        new StreamBarResponseMsg(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) =>
        StreamBarResponseMsg.decode(argBuf)
    },
    fooClientStream: {
      path: '/TestSvc/FooClientStream',
      requestStream: true,
      responseStream: false,
      requestType: FooRequestMsg,
      responseType: BarResponseMsg,
      requestSerialize: (args: FooRequest) =>
        new FooRequestMsg(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
      responseSerialize: (args: BarResponse) =>
        new BarResponseMsg(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) => BarResponseMsg.decode(argBuf)
    },
    fooBidiStream: {
      path: '/TestSvc/FooBidiStream',
      requestStream: true,
      responseStream: true,
      requestType: FooRequestMsg,
      responseType: StreamBarResponseMsg,
      requestSerialize: (args: FooRequest) =>
        new FooRequestMsg(args).encode().finish() as Buffer,
      requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
      responseSerialize: (args: StreamBarResponse) =>
        new StreamBarResponseMsg(args).encode().finish() as Buffer,
      responseDeserialize: (argBuf: Buffer) =>
        StreamBarResponseMsg.decode(argBuf)
    }
  };

  export interface TestSvcImplementation extends grpcts.Implementations {
    foo(call: grpc.ServerUnaryCall<FooRequest>): Promise<BarResponse>;
    foo(
      call: grpc.ServerUnaryCall<FooRequest>,
      callback: grpc.sendUnaryData<BarResponse>
    ): void;
    fooServerStream(call: grpc.ServerWriteableStream<FooRequest>): void;
    fooClientStream(
      call: grpc.ServerReadableStream<FooRequest>
    ): Promise<BarResponse>;
    fooClientStream(
      call: grpc.ServerReadableStream<FooRequest>,
      callback: grpc.sendUnaryData<BarResponse>
    ): void;
    fooBidiStream(
      call: grpc.ServerDuplexStream<FooRequest, StreamBarResponse>
    ): void;
  }

  export class TestSvcClient extends grpcts.Client {
    public foo(req: FooRequest, metadata?: grpcts.Metadata) {
      return super.makeUnaryRequest<FooRequest, BarResponse>(
        'foo',
        req,
        metadata
      );
    }
    public fooServerStream(req: FooRequest, metadata?: grpcts.Metadata) {
      return super.makeServerStreamRequest<FooRequest, StreamBarResponse>(
        'fooServerStream',
        req,
        metadata
      );
    }
    public fooClientStream(metadata?: grpcts.Metadata) {
      return super.makeClientStreamRequest<FooRequest, BarResponse>(
        'fooClientStream',
        metadata
      );
    }
    public fooBidiStream(metadata?: grpcts.Metadata) {
      return super.makeBidiStreamRequest<FooRequest, StreamBarResponse>(
        'fooBidiStream',
        metadata
      );
    }
  }
}

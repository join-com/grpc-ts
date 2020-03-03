// GENERATED CODE -- DO NOT EDIT!
import { GoogleProtobuf } from '../google/protobuf/Empty';
import * as protobufjs from 'protobufjs/minimal';
// @ts-ignore ignored as it's generated and it's difficult to predict if logger is needed
import { logger } from '@join-com/gcloud-logger-trace';
export namespace FooCommon {
  export interface IEmptyMessage {
    field?: GoogleProtobuf.IEmpty;
  }

  export class EmptyMessage implements IEmptyMessage {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new EmptyMessage();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.field = GoogleProtobuf.Empty.decode(
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
    public field?: GoogleProtobuf.IEmpty;
    constructor(attrs?: IEmptyMessage) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.field != null) {
        const msg = new GoogleProtobuf.Empty(this.field);
        msg.encode(writer.uint32(10).fork()).ldelim();
      }
      return writer;
    }
  }
}

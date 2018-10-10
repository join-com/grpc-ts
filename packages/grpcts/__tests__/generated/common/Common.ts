// GENERATED CODE -- DO NOT EDIT!
import { GoogleProtobuf } from '../google/protobuf/Empty';
import * as protobufjs from 'protobufjs/minimal';
export namespace FooCommon {
  export interface EmptyMessage {
    field?: GoogleProtobuf.Empty;
  }

  export class EmptyMessageMsg implements EmptyMessage {
    public static decode(
      inReader: Uint8Array | protobufjs.Reader,
      length?: number
    ) {
      const reader = !(inReader instanceof protobufjs.Reader)
        ? protobufjs.Reader.create(inReader)
        : inReader;
      const end = length === undefined ? reader.len : reader.pos + length;
      const message = new EmptyMessageMsg();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.field = GoogleProtobuf.EmptyMsg.decode(
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
    public field?: GoogleProtobuf.Empty;
    constructor(attrs?: EmptyMessage) {
      Object.assign(this, attrs);
    }
    public encode(writer: protobufjs.Writer = protobufjs.Writer.create()) {
      if (this.field != null) {
        const msg = new GoogleProtobuf.EmptyMsg(this.field);
        msg.encode(writer.uint32(10).fork()).ldelim();
      }
      return writer;
    }
  }
}

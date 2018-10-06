// GENERATED CODE -- DO NOT EDIT!
import * as protobufjs from 'protobufjs/minimal';
export namespace GoogleProtobuf {

export interface Empty {
}

export class EmptyMsg implements Empty{
public static decode(inReader: Uint8Array | protobufjs.Reader, length?: number){
const reader = !(inReader instanceof protobufjs.Reader)
? protobufjs.Reader.create(inReader)
: inReader
const end = length === undefined ? reader.len : reader.pos + length;
const message = new EmptyMsg();
while (reader.pos < end) {
const tag = reader.uint32()
switch (tag >>> 3) {
default:
reader.skipType(tag & 7);
break;
}
}
return message;
}
constructor(attrs?: Empty){
Object.assign(this, attrs)
}
public encode(writer: protobufjs.Writer = protobufjs.Writer.create()){
return writer
}
}
}

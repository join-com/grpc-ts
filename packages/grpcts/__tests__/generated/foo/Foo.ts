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

export class FooRequestMsg implements FooRequest{
public static decode(inReader: Uint8Array | protobufjs.Reader, length?: number){
const reader = !(inReader instanceof protobufjs.Reader)
? protobufjs.Reader.create(inReader)
: inReader
const end = length === undefined ? reader.len : reader.pos + length;
const message = new FooRequestMsg();
while (reader.pos < end) {
const tag = reader.uint32()
switch (tag >>> 3) {
case 1:
message._id = reader.int32();
break;
case 2:
if (!(message._name && message._name.length)) {
message._name = [];
}
message._name.push(reader.string());
break;
case 3:
message._password = reader.string();
break;
case 4:
message._token = reader.string();
break;
case 5:
message._empty = FooCommon.EmptyMessageMsg.decode(reader, reader.uint32());
break;
default:
reader.skipType(tag & 7);
break;
}
}
return message;
}
private _id?: number;
private _name?: string[];
private _password?: string;
private _token?: string;
private _empty?: FooCommon.EmptyMessage;
constructor(attrs?: FooRequest){
Object.assign(this, attrs)
}
public encode(writer: protobufjs.Writer = protobufjs.Writer.create()){
if (this._id != null) {
writer.uint32(8).int32(this._id);
}
if (this._name != null) {
for (const value of this._name) {
writer.uint32(18).string(value);
}
}
if (this._password != null) {
writer.uint32(26).string(this._password);
}
if (this._token != null) {
writer.uint32(34).string(this._token);
}
if (this._empty != null) {
const msg = new FooCommon.EmptyMessageMsg(this._empty);
msg.encode(writer.uint32(42).fork()).ldelim();
}
return writer
}
public get id() {
return this._id;
}
public set id(val) {
this._id = val;
}
public get name() {
return this._name;
}
public set name(val) {
this._name = val;
}
public get password() {
return this._password;
}
public set password(val) {
this._password = val;
}
public get token() {
return this._token;
}
public set token(val) {
this._token = val;
}
public get empty() {
return this._empty;
}
public set empty(val) {
this._empty = new FooCommon.EmptyMessageMsg(val);
}
}

export interface StreamBarResponse {
result?: string;
}

export class StreamBarResponseMsg implements StreamBarResponse{
public static decode(inReader: Uint8Array | protobufjs.Reader, length?: number){
const reader = !(inReader instanceof protobufjs.Reader)
? protobufjs.Reader.create(inReader)
: inReader
const end = length === undefined ? reader.len : reader.pos + length;
const message = new StreamBarResponseMsg();
while (reader.pos < end) {
const tag = reader.uint32()
switch (tag >>> 3) {
case 1:
message._result = reader.string();
break;
default:
reader.skipType(tag & 7);
break;
}
}
return message;
}
private _result?: string;
constructor(attrs?: StreamBarResponse){
Object.assign(this, attrs)
}
public encode(writer: protobufjs.Writer = protobufjs.Writer.create()){
if (this._result != null) {
writer.uint32(10).string(this._result);
}
return writer
}
public get result() {
return this._result;
}
public set result(val) {
this._result = val;
}
}

export interface BarResponse {
result?: string;
}

export class BarResponseMsg implements BarResponse{
public static decode(inReader: Uint8Array | protobufjs.Reader, length?: number){
const reader = !(inReader instanceof protobufjs.Reader)
? protobufjs.Reader.create(inReader)
: inReader
const end = length === undefined ? reader.len : reader.pos + length;
const message = new BarResponseMsg();
while (reader.pos < end) {
const tag = reader.uint32()
switch (tag >>> 3) {
case 2:
message._result = reader.string();
break;
default:
reader.skipType(tag & 7);
break;
}
}
return message;
}
private _result?: string;
constructor(attrs?: BarResponse){
Object.assign(this, attrs)
}
public encode(writer: protobufjs.Writer = protobufjs.Writer.create()){
if (this._result != null) {
writer.uint32(18).string(this._result);
}
return writer
}
public get result() {
return this._result;
}
public set result(val) {
this._result = val;
}
}

export const testSvcServiceDefinition = {
foo: {
path: '/TestSvc/Foo',
requestStream: false,
responseStream: false,
requestType: FooRequestMsg,
responseType: BarResponseMsg,
requestSerialize: (args: FooRequest) => new FooRequestMsg(args).encode().finish() as Buffer,
requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
responseSerialize: (args: BarResponse) => new BarResponseMsg(args).encode().finish() as Buffer,
responseDeserialize: (argBuf: Buffer) => BarResponseMsg.decode(argBuf),
},
fooServerStream: {
path: '/TestSvc/FooServerStream',
requestStream: false,
responseStream: true,
requestType: FooRequestMsg,
responseType: StreamBarResponseMsg,
requestSerialize: (args: FooRequest) => new FooRequestMsg(args).encode().finish() as Buffer,
requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
responseSerialize: (args: StreamBarResponse) => new StreamBarResponseMsg(args).encode().finish() as Buffer,
responseDeserialize: (argBuf: Buffer) => StreamBarResponseMsg.decode(argBuf),
},
fooClientStream: {
path: '/TestSvc/FooClientStream',
requestStream: true,
responseStream: false,
requestType: FooRequestMsg,
responseType: BarResponseMsg,
requestSerialize: (args: FooRequest) => new FooRequestMsg(args).encode().finish() as Buffer,
requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
responseSerialize: (args: BarResponse) => new BarResponseMsg(args).encode().finish() as Buffer,
responseDeserialize: (argBuf: Buffer) => BarResponseMsg.decode(argBuf),
},
fooBieStream: {
path: '/TestSvc/FooBieStream',
requestStream: true,
responseStream: true,
requestType: FooRequestMsg,
responseType: StreamBarResponseMsg,
requestSerialize: (args: FooRequest) => new FooRequestMsg(args).encode().finish() as Buffer,
requestDeserialize: (argBuf: Buffer) => FooRequestMsg.decode(argBuf),
responseSerialize: (args: StreamBarResponse) => new StreamBarResponseMsg(args).encode().finish() as Buffer,
responseDeserialize: (argBuf: Buffer) => StreamBarResponseMsg.decode(argBuf),
},
}

export interface TestSvcImplementation extends grpcts.Implementations {
foo(call: grpc.ServerUnaryCall<FooRequest>): Promise<BarResponse>;
foo(call: grpc.ServerUnaryCall<FooRequest>, callback: grpc.sendUnaryData<BarResponse>): void;
fooServerStream(call: grpc.ServerWriteableStream<FooRequest>): void;
fooClientStream(call: grpc.ServerReadableStream<FooRequest>): Promise<BarResponse>;
fooClientStream(call: grpc.ServerReadableStream<FooRequest>, callback: grpc.sendUnaryData<BarResponse>): void;
fooBieStream(call: grpc.ServerDuplexStream<FooRequest, StreamBarResponse>): void;
}
}

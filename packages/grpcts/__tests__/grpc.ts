// import * as grpc from 'grpc';
// import { Server } from '../src/Server';
// import { FooTest } from './generated/foo/Foo';

// const foo = async (req: FooTest.FooRequest): Promise<string> => {
//   console.log(req.name);
//   return `foo result: ${req.id} ${req.name}`;
// };

// const fooServerStream = (
//   req: FooTest.FooRequest,
//   stream: grpc.ServerWriteableStream<FooTest.StreamBarResponse>
// ): void => {
//   stream.write({ result: req.name });
//   stream.end();
// };

// const fooClientStream = async (
//   req: grpc.ServerReadableStream<FooTest.FooRequest>
// ): Promise<string> => {
//   let result = '';
//   for await (const reqRaw of req as any) {
//     const request: FooTest.FooRequest = reqRaw;
//     result += request.id;
//   }
//   return `fooClientStream -> ${result}`;
// };

// const fooBidiStream = async (
//   duplexStream: grpc.ServerDuplexStream<
//     FooTest.FooRequest,
//     FooTest.StreamBarResponse
//   >
// ): Promise<void> => {
//   for await (const reqRaw of duplexStream as any) {
//     const req: FooTest.FooRequest = reqRaw;
//     duplexStream.write({ result: req.name });
//   }
//   duplexStream.end();
//   return;
// };

// xdescribe('grpc test', () => {
//   let server: Server;
//   let client: FooTest.TestSvcClient;
//   beforeAll(async () => {
//     const service = new FooTest.TestSvcService({
//       foo,
//       fooServerStream,
//       fooClientStream,
//       fooBidiStream
//     });
//     server = new Server(grpc.ServerCredentials.createInsecure());
//     server.addService(service);
//     await server.start('0.0.0.0:0');
//     client = new FooTest.TestSvcClient(
//       `0.0.0.0:${server.port}`,
//       grpc.credentials.createInsecure()
//     );
//   });

//   afterAll(async () => {
//     client.close();
//     await server.tryShutdown();
//   });

//   fit('unary grpc', async () => {
//     const result = await client.foo({
//       id: 11,
//       // name: ['name'],
//       password: 'saasdas',
//       token: 'aaas'
//     });
//     expect(result).toEqual('foo result: 11 name');
//   });

//   it('server stream grpc', done => {
//     const result = client.fooServerStream({ id: 11, name: 'Foo stream' });
//     result.on('data', data => {
//       expect(data).toEqual({ result: 'Foo stream' });
//       done();
//     });
//   });

//   it('client streams grpc', done => {
//     const stream = client.fooClientStream((_, result) => {
//       expect(result).toEqual('fooClientStream -> 37');
//       done();
//       return;
//     });
//     stream.write({ id: 3, name: 'aaa' });
//     stream.write({ id: 7 });
//     stream.end();
//   });

//   it('bie streams grpc', async () => {
//     const stream = client.fooBidiStream();
//     stream.write({ id: 3, name: 'aaa' });
//     stream.write({ id: 7, name: 'bbb' });
//     stream.end();
//     const results: any[] = [];
//     for await (const reqRaw of stream as any) {
//       const request: FooTest.StreamBarResponse = reqRaw;
//       results.push(request);
//     }
//     expect(results).toEqual([{ result: 'aaa' }, { result: 'bbb' }]);
//   });
// });

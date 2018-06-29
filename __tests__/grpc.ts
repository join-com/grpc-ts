import * as grpc from 'grpc';
import { Server } from '../src/Server';
import { Foo } from './generated/foo/Foo';

const foo = async (req: Foo.FooRequest): Promise<string> => {
  return `foo result: ${req.id} ${req.name}`;
};

const fooServerStream = (
  req: Foo.FooRequest,
  stream: grpc.ServerWriteableStream<Foo.StreamBarResponse>,
): void => {
  stream.write({ result: req.name });
  stream.end();
};

const fooClientStream = async (
  req: grpc.ServerReadableStream<Foo.FooRequest>,
): Promise<string> => {
  let result = '';
  for await (const reqRaw of req as any) {
    const request: Foo.FooRequest = reqRaw;
    result += request.id;
  }
  return `fooClientStream -> ${result}`;
};

const fooBieStream = async (
  duplexStream: grpc.ServerDuplexStream<Foo.FooRequest, Foo.StreamBarResponse>,
): Promise<void> => {
  for await (const reqRaw of duplexStream as any) {
    const req: Foo.FooRequest = reqRaw;
    duplexStream.write({ result: req.name });
  }
  duplexStream.end();
  return;
};

describe('grpc test', () => {
  let server: Server;
  let client: Foo.TestSvcClient;
  beforeAll(async () => {
    const service = new Foo.TestSvcService({
      foo,
      fooServerStream,
      fooClientStream,
      fooBieStream,
    });
    server = new Server(grpc.ServerCredentials.createInsecure());
    server.addService(service);
    await server.start('0.0.0.0:0');
    client = new Foo.TestSvcClient(
      `0.0.0.0:${server.port}`,
      grpc.credentials.createInsecure(),
    );
  });

  afterAll(async () => {
    client.close();
    await server.tryShutdown();
  });

  it('unary grpc', async () => {
    const result = await client.foo({
      id: 11,
      name: 'name',
      password: 'saasdas',
      token: 'aaas',
    });
    expect(result).toEqual('foo result: 11 name');
  });

  it('server stream grpc', done => {
    const result = client.fooServerStream({ id: 11, name: 'Foo stream' });
    result.on('data', data => {
      expect(data).toEqual({ result: 'Foo stream' });
      done();
    });
  });

  it('client streams grpc', done => {
    const stream = client.fooClientStream((_, result) => {
      expect(result).toEqual('fooClientStream -> 37');
      done();
      return;
    });
    stream.write({ id: 3, name: 'aaa' });
    stream.write({ id: 7 });
    stream.end();
  });

  it('bie streams grpc', async () => {
    const stream = client.fooBieStream();
    stream.write({ id: 3, name: 'aaa' });
    stream.write({ id: 7, name: 'bbb' });
    stream.end();
    const results: any[] = [];
    for await (const reqRaw of stream as any) {
      const request: Foo.StreamBarResponse = reqRaw;
      results.push(request);
    }
    expect(results).toEqual([{ result: 'aaa' }, { result: 'bbb' }]);
  });
});

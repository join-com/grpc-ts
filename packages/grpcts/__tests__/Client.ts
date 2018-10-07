import { FooTest } from './generated/foo/Foo';
import * as grpc from 'grpc';
import { Client } from '../src';

const server = new grpc.Server();
server.addService(FooTest.testSvcServiceDefinition, {
  foo: jest.fn((_, callback) => {
    callback(null, { result: 'ok' });
  }),
  fooServerStream: jest.fn(call => {
    call.write({ result: call.request.name[0] });
    call.end();
  }),
  fooClientStream: jest.fn((call, callback) => {
    let result = '';
    call.on('data', (data: FooTest.FooRequest) => (result += data.id));
    call.on('end', () => callback(null, { result }));
  }),
  fooBidiStream: jest.fn()
});

const port = server.bind('0.0.0.0:0', grpc.ServerCredentials.createInsecure());
server.start();

class TestSvcClient extends Client {
  public foo(req: FooTest.FooRequest) {
    return this.makeUnaryRequest<FooTest.FooRequest, FooTest.BarResponse>(
      'foo',
      req
    );
  }

  public fooClientStream() {
    return this.makeClientStreamRequest<
      FooTest.FooRequest,
      FooTest.BarResponse
    >('fooClientStream');
  }

  public fooServerStream(req: FooTest.FooRequest) {
    return this.makeServerStreamRequest<
      FooTest.FooRequest,
      FooTest.BarResponse
    >('fooServerStream', req);
  }
}

const client = new TestSvcClient(
  FooTest.testSvcServiceDefinition,
  `0.0.0.0:${port}`,
  grpc.credentials.createInsecure()
);

describe('Client', () => {
  afterAll(() => {
    client.close();
    server.forceShutdown();
  });

  describe('unary call', () => {
    it('makes request', async () => {
      const { res } = client.foo({});
      expect(await res).toEqual({ _result: 'ok' });
    });
  });

  describe('client stream call', () => {
    it('calls correctly', async () => {
      const { call, res } = client.fooClientStream();
      call.write({ id: 3, name: ['Bar'] });
      call.write({ id: 7 });
      call.end();
      expect(await res).toEqual({ _result: '37' });
    });
  });

  describe('server stream call', () => {
    it('calls correctly', async () => {
      const { call } = client.fooServerStream({ name: ['john'] });
      let result: string = '';
      for await (const reqRaw of call as any) {
        const request: FooTest.BarResponse = reqRaw;
        result += request.result;
      }
      expect(result).toEqual('john');
    });
  });
});

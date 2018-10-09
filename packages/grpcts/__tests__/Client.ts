import { FooTest } from './generated/foo/Foo';
import * as grpc from 'grpc';
import { Client } from '../src';
import { Metadata } from '../src/metadata';

const server = new grpc.Server();
const implementationsMock = {
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
  fooBidiStream: jest.fn(async call => {
    for await (const reqRaw of call as any) {
      const req: FooTest.FooRequest = reqRaw;
      call.write({ result: `${req.id}` });
    }
    call.end();
  })
};
server.addService(FooTest.testSvcServiceDefinition, implementationsMock);

const port = server.bind('0.0.0.0:0', grpc.ServerCredentials.createInsecure());
server.start();

class TestSvcClient extends Client {
  public foo(req: FooTest.FooRequest, metadata?: Metadata) {
    return this.makeUnaryRequest<FooTest.FooRequest, FooTest.BarResponse>(
      'foo',
      req,
      metadata
    );
  }

  public fooClientStream(metadata?: Metadata) {
    return this.makeClientStreamRequest<
      FooTest.FooRequest,
      FooTest.BarResponse
    >('fooClientStream', metadata);
  }

  public fooServerStream(req: FooTest.FooRequest, metadata?: Metadata) {
    return this.makeServerStreamRequest<
      FooTest.FooRequest,
      FooTest.BarResponse
    >('fooServerStream', req, metadata);
  }

  public fooBidiStream(metadata?: Metadata) {
    return this.makeBidiStreamRequest<FooTest.FooRequest, FooTest.BarResponse>(
      'fooBidiStream',
      metadata
    );
  }
}

const traceContextName = 'trace-name';
const traceContext = 'trace-context';
let trace = {
  getTraceContextName: () => traceContextName,
  getTraceContext: () => traceContext
};

const client = new TestSvcClient(
  FooTest.testSvcServiceDefinition,
  `0.0.0.0:${port}`,
  grpc.credentials.createInsecure(),
  trace
);

describe('Client', () => {
  afterAll(() => {
    client.close();
    server.forceShutdown();
  });

  beforeEach(() => {
    implementationsMock.foo.mockClear();
    implementationsMock.fooClientStream.mockClear();
    implementationsMock.fooServerStream.mockClear();
    implementationsMock.fooBidiStream.mockClear();
  });

  describe('unary call', () => {
    describe('success', () => {
      let response: FooTest.BarResponse;
      beforeEach(async () => {
        const { res } = client.foo({}, { foo: 'bar' });
        response = await res;
      });

      it('makes request', async () => {
        expect(response).toEqual({ _result: 'ok' });
      });

      it('attaches traceId', async () => {
        const { metadata } = implementationsMock.foo.mock.calls[0][0];
        expect(metadata.get(traceContextName)).toEqual([traceContext]);
      });

      it('sends metadata', async () => {
        const { metadata } = implementationsMock.foo.mock.calls[0][0];
        expect(metadata.get('foo')).toEqual(['bar']);
      });
    });

    describe('error', () => {
      describe('error key in metadata', () => {
        beforeEach(() => {
          implementationsMock.foo.mockImplementation(
            (_: any, callback: grpc.sendUnaryData<any>) => {
              const e = new Error('my error') as any;
              e.code = 'MY_ERROR';
              const metadata = new grpc.Metadata();
              metadata.set(
                'error',
                JSON.stringify(
                  e,
                  Object.getOwnPropertyNames(e).filter(prop => prop !== 'stack')
                )
              );
              metadata.set('foo', 'bar');
              callback(
                {
                  code: grpc.status.UNKNOWN,
                  metadata
                } as any,
                {}
              );
            }
          );
        });

        let error: any;

        beforeEach(async () => {
          try {
            const { res } = client.foo({});
            await res;
            expect('have not called').toEqual('have called');
          } catch (e) {
            error = e;
          }
        });

        it('returns an error from metadata', () => {
          expect(error.code).toEqual('MY_ERROR');
          expect(error.message).toEqual('my error');
          expect(error.grpcCode).toEqual(grpc.status.UNKNOWN);
        });

        it('attaches metadata', async () => {
          expect(error.metadata.get('foo')).toEqual(['bar']);
        });

        it('attaches traceId', async () => {
          const { metadata } = implementationsMock.foo.mock.calls[0][0];
          expect(metadata.get(traceContextName)).toEqual([traceContext]);
        });
      });

      describe('no error key in metadata', () => {
        beforeEach(() => {
          implementationsMock.foo.mockImplementation(
            (_: any, callback: grpc.sendUnaryData<any>) => {
              callback({ code: grpc.status.UNKNOWN } as any, {});
            }
          );
        });

        it('returns an grpc error', async () => {
          try {
            const { res } = client.foo({});
            await res;
            expect('have not called').toEqual('have called');
          } catch (e) {
            expect(e.message).toEqual('2 UNKNOWN: Unknown Error');
            expect(e.grpcCode).toEqual(grpc.status.UNKNOWN);
          }
        });
      });
    });
  });

  describe('client stream call', () => {
    describe('success', () => {
      let response: FooTest.BarResponse;
      beforeEach(async () => {
        const { call, res } = client.fooClientStream({ foo: 'bar' });
        call.write({ id: 3, name: ['Bar'] });
        call.write({ id: 7 });
        call.end();
        response = await res;
      });

      it('calls correctly', () => {
        expect(response).toEqual({ _result: '37' });
      });

      it('attaches traceId', async () => {
        const {
          metadata
        } = implementationsMock.fooClientStream.mock.calls[0][0];
        expect(metadata.get(traceContextName)).toEqual([traceContext]);
      });

      it('sends metadata', async () => {
        const {
          metadata
        } = implementationsMock.fooClientStream.mock.calls[0][0];
        expect(metadata.get('foo')).toEqual(['bar']);
      });
    });

    describe('error', () => {
      describe('error key in metadata', () => {
        beforeEach(() => {
          implementationsMock.fooClientStream.mockImplementation(
            (_: any, callback: grpc.sendUnaryData<any>) => {
              const e = new Error('my error') as any;
              e.code = 'MY_ERROR';
              const metadata = new grpc.Metadata();
              metadata.set(
                'error',
                JSON.stringify(
                  e,
                  Object.getOwnPropertyNames(e).filter(prop => prop !== 'stack')
                )
              );
              metadata.set('foo', 'bar');
              callback(
                {
                  code: grpc.status.UNKNOWN,
                  metadata
                } as any,
                {}
              );
            }
          );
        });

        let error: any;

        beforeEach(async () => {
          try {
            const { res, call } = client.fooClientStream();
            call.write({ id: 7 });
            call.end();
            await res;
            expect('have not called').toEqual('have called');
          } catch (e) {
            error = e;
          }
        });

        it('returns an error from metadata', () => {
          expect(error.code).toEqual('MY_ERROR');
          expect(error.message).toEqual('my error');
          expect(error.grpcCode).toEqual(grpc.status.UNKNOWN);
        });

        it('attaches metadata', async () => {
          expect(error.metadata.get('foo')).toEqual(['bar']);
        });

        it('attaches traceId', async () => {
          const {
            metadata
          } = implementationsMock.fooClientStream.mock.calls[0][0];
          expect(metadata.get(traceContextName)).toEqual([traceContext]);
        });
      });

      describe('no error key in metadata', () => {
        beforeEach(() => {
          implementationsMock.fooClientStream.mockImplementation(
            (_: any, callback: grpc.sendUnaryData<any>) => {
              callback({ code: grpc.status.UNKNOWN } as any, {});
            }
          );
        });

        it('returns an grpc error', async () => {
          try {
            const { res, call } = client.fooClientStream();
            call.write({ id: 7 });
            call.end();
            await res;
            expect('have not called').toEqual('have called');
          } catch (e) {
            expect(e.message).toEqual('2 UNKNOWN: Unknown Error');
            expect(e.grpcCode).toEqual(grpc.status.UNKNOWN);
          }
        });
      });
    });
  });

  describe('server stream call', () => {
    let result: string = '';
    beforeEach(async () => {
      const { call } = client.fooServerStream(
        { name: ['john'] },
        { foo: 'bar' }
      );
      for await (const reqRaw of call as any) {
        const request: FooTest.BarResponse = reqRaw;
        result += request.result;
      }
    });

    it('calls correctly', async () => {
      expect(result).toEqual('john');
    });

    it('sends metadata', async () => {
      const { metadata } = implementationsMock.fooServerStream.mock.calls[0][0];
      expect(metadata.get('foo')).toEqual(['bar']);
    });
  });

  describe('bidi stream call', () => {
    let result: string = '';
    beforeEach(async () => {
      const { call } = client.fooBidiStream({ foo: 'bar' });
      call.write({ id: 3, name: ['Bar'] });
      call.write({ id: 7 });
      call.end();
      for await (const reqRaw of call as any) {
        const request: FooTest.BarResponse = reqRaw;
        result += request.result;
      }
    });

    it('calls correctly', async () => {
      expect(result).toEqual('37');
    });

    it('sends metadata', async () => {
      const { metadata } = implementationsMock.fooBidiStream.mock.calls[0][0];
      expect(metadata.get('foo')).toEqual(['bar']);
    });
  });
});
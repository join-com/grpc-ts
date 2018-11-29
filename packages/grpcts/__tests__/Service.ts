import { Service, Trace } from '../src/Service';
import { FooTest } from './generated/foo/Foo';
import * as grpc from 'grpc';

let client: grpc.Client;
let server: grpc.Server;
let logger = {
  info: jest.fn()
};

const traceContextName = 'trace-context-name';
let trace: Trace = {
  getTraceContextName: () => traceContextName,
  start: jest.fn()
};

const startService = (implementations: FooTest.TestSvcImplementation) => {
  const service = new Service<FooTest.TestSvcImplementation>(
    FooTest.testSvcServiceDefinition,
    implementations,
    logger,
    trace
  );

  server = new grpc.Server();
  server.addService(service.serviceDefinition, service.implementations);

  const port = server.bind(
    '0.0.0.0:0',
    grpc.ServerCredentials.createInsecure()
  );
  server.start();

  const TestSvcClient = grpc.makeGenericClientConstructor(
    FooTest.testSvcServiceDefinition,
    'Users',
    {}
  );
  client = new TestSvcClient(
    `0.0.0.0:${port}`,
    grpc.credentials.createInsecure()
  );
};

describe('Service', () => {
  afterAll(() => {
    client.close();
    server.forceShutdown();
  });

  describe('unary call', () => {
    describe('promise implementation', () => {
      const fooMock = jest.fn(async () => ({ result: 'ok' }));

      beforeAll(() => {
        startService({
          foo: fooMock,
          fooServerStream: jest.fn(),
          fooClientStream: jest.fn(),
          fooBidiStream: jest.fn()
        });
      });

      beforeEach(() => {
        fooMock.mockClear();
        logger.info.mockClear();
      });

      describe('success', () => {
        it('calls with correct attributes', done => {
          const req: FooTest.FooRequest = {
            id: 11,
            name: ['john', 'doe'],
            password: 'qwerty',
            empty: {}
          };
          (client as any)['foo'](req, () => {
            const call = fooMock.mock.calls[0][0];
            expect(call.request.empty).toEqual({});
            expect(call.request.id).toEqual(11);
            expect(call.request.name).toEqual(['john', 'doe']);
            expect(call.request.password).toEqual('qwerty');
            done();
          });
        });

        it('returns correct result', done => {
          (client as any)['foo'](
            {},
            (_: any, response: FooTest.BarResponse) => {
              expect(response.result).toEqual('ok');
              done();
            }
          );
        });

        it('logs request and response', done => {
          const req: FooTest.FooRequest = {
            id: 11,
            name: ['john', 'doe'],
            password: 'qwerty',
            empty: {}
          };
          (client as any)['foo'](req, () => {
            expect(logger.info).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith('GRPC /TestSvc/Foo', {
              path: '/TestSvc/Foo',
              request: {
                id: 11,
                name: ['john', 'doe'],
                password: 'qwerty',
                empty: {}
              },
              response: { result: 'ok' }
            });
            done();
          });
        });

        describe('tracing', () => {
          it('starts tracing when trace id is sent', done => {
            const traceId = '66551gggd7128218g28g182dg8172';
            const metadata = new grpc.Metadata();
            metadata.set(traceContextName, traceId);
            (client as any).foo({}, metadata, () => {
              expect(trace.start).toHaveBeenCalledWith(traceId);
              done();
            });
          });
        });
      });

      describe('error', () => {
        beforeEach(() => {
          fooMock.mockImplementation(async () => {
            const err: any = new Error('Something wrong æøå');
            err.nested = [
              {
                nestedField: 'nested'
              }
            ];
            throw err;
          });
        });

        it('returns unknown status', done => {
          (client as any)['foo']({}, (error: any, _: FooTest.BarResponse) => {
            expect(error.code).toEqual(2);
            done();
          });
        });

        it('returns error in metadata', done => {
          (client as any)['foo']({}, (error: any, _: FooTest.BarResponse) => {
            const err = JSON.parse(
              error.metadata.get('error-bin').toString('utf8')
            );
            expect(err.message).toEqual('Something wrong æøå');
            done();
          });
        });

        it('converts nested propery', done => {
          (client as any)['foo']({}, (error: any, _: FooTest.BarResponse) => {
            const err = JSON.parse(
              error.metadata.get('error-bin').toString('utf8')
            );
            expect(err.nested).toEqual([
              {
                nestedField: 'nested'
              }
            ]);
            done();
          });
        });
      });
    });

    describe('callback implementation', () => {
      const fooMock = jest.fn((_, callback) => {
        callback(null, { result: 'ok' });
      });

      beforeAll(() => {
        startService({
          foo: fooMock,
          fooServerStream: jest.fn(),
          fooClientStream: jest.fn(),
          fooBidiStream: jest.fn()
        });
      });

      beforeEach(() => {
        logger.info.mockClear();
        fooMock.mockClear();
      });

      describe('success', () => {
        it('calls with correct attributes', done => {
          const req: FooTest.FooRequest = {
            id: 11,
            name: ['john', 'doe'],
            password: 'qwerty',
            empty: {}
          };
          (client as any)['foo'](req, () => {
            const call = fooMock.mock.calls[0][0];
            expect(call.request.empty).toEqual({});
            expect(call.request.id).toEqual(11);
            expect(call.request.name).toEqual(['john', 'doe']);
            expect(call.request.password).toEqual('qwerty');
            done();
          });
        });

        it('returns correct result', done => {
          (client as any)['foo'](
            {},
            (_: any, response: FooTest.BarResponse) => {
              expect(response.result).toEqual('ok');
              done();
            }
          );
        });

        it('logs request and response', done => {
          const req: FooTest.FooRequest = {
            id: 11,
            name: ['john', 'doe'],
            password: 'qwerty',
            empty: {}
          };
          (client as any)['foo'](req, () => {
            expect(logger.info).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith('GRPC /TestSvc/Foo', {
              path: '/TestSvc/Foo',
              request: {
                id: 11,
                name: ['john', 'doe'],
                password: 'qwerty',
                empty: {}
              },
              response: { result: 'ok' }
            });
            done();
          });
        });
      });
    });
  });

  describe('client stream call', () => {
    describe('promise implementation', () => {
      const fooClientStreamMock = jest.fn(async call => {
        let result = '';
        for await (const reqRaw of call as any) {
          const request: FooTest.FooRequest = reqRaw;
          result += request.id;
        }
        return { result: `fooClientStream -> ${result}` };
      });

      beforeAll(() => {
        startService({
          foo: jest.fn(),
          fooServerStream: jest.fn(),
          fooClientStream: fooClientStreamMock,
          fooBidiStream: jest.fn()
        });
      });

      beforeEach(() => {
        fooClientStreamMock.mockClear();
        logger.info.mockClear();
      });

      describe('success', () => {
        it('calls correctly', done => {
          const stream = (client as any).fooClientStream(
            (_: any, response: FooTest.BarResponse) => {
              expect(response.result).toEqual('fooClientStream -> 37');
              done();
              return;
            }
          );
          stream.write({ id: 3, name: 'Bar' });
          stream.write({ id: 7 });
          stream.end();
        });
        it('logs request and response', done => {
          const stream = (client as any).fooClientStream(
            (_: any, __: FooTest.BarResponse) => {
              expect(logger.info).toHaveBeenCalledTimes(1);
              expect(logger.info).toHaveBeenCalledWith(
                'GRPC /TestSvc/FooClientStream',
                {
                  path: '/TestSvc/FooClientStream',
                  request: 'STREAM',
                  response: { result: 'fooClientStream -> 37' }
                }
              );
              done();
              return;
            }
          );
          stream.write({ id: 3, name: 'Bar' });
          stream.write({ id: 7 });
          stream.end();
        });
      });

      describe('error', () => {
        beforeEach(() => {
          fooClientStreamMock.mockImplementation(async () => {
            throw new Error('Something wrong');
          });
        });

        it('returns unknown status', done => {
          const stream = (client as any).fooClientStream(
            (error: any, _: FooTest.BarResponse) => {
              expect(error.code).toEqual(2);
              done();
            }
          );
          stream.write({ id: 3, name: 'Bar' });
          stream.end();
        });

        it('returns error in metadata', done => {
          const stream = (client as any).fooClientStream(
            (error: any, _: FooTest.BarResponse) => {
              const err = JSON.parse(
                error.metadata.get('error-bin').toString('utf8')
              );
              expect(err.message).toEqual('Something wrong');
              done();
            }
          );
          stream.write({ id: 3, name: 'Bar' });
          stream.end();
        });
      });
    });

    describe('callback implementation', () => {
      const fooMock = jest.fn((_, callback) => {
        callback(null, { result: 'ok' });
      });

      beforeAll(() => {
        startService({
          foo: fooMock,
          fooServerStream: jest.fn(),
          fooClientStream: jest.fn(),
          fooBidiStream: jest.fn()
        });
      });

      beforeEach(() => {
        fooMock.mockClear();
      });

      describe('success', () => {
        it('calls with correct attributes', done => {
          const req: FooTest.FooRequest = {
            id: 11,
            name: ['john', 'doe'],
            password: 'qwerty',
            empty: {}
          };
          (client as any)['foo'](req, () => {
            const call = fooMock.mock.calls[0][0];
            expect(call.request.empty).toEqual({});
            expect(call.request.id).toEqual(11);
            expect(call.request.name).toEqual(['john', 'doe']);
            expect(call.request.password).toEqual('qwerty');
            done();
          });
        });
        it('returns correct result', done => {
          (client as any)['foo'](
            {},
            (_: any, response: FooTest.BarResponse) => {
              expect(response.result).toEqual('ok');
              done();
            }
          );
        });
      });
    });
  });

  describe('server stream call', () => {
    const fooServerStreamMock = jest.fn(call => {
      call.write({ result: call.request.name[0] });
      call.end();
    });

    beforeAll(() => {
      startService({
        foo: jest.fn(),
        fooServerStream: fooServerStreamMock,
        fooClientStream: jest.fn(),
        fooBidiStream: jest.fn()
      });
    });

    beforeEach(() => {
      fooServerStreamMock.mockClear();
      logger.info.mockClear();
    });

    it('calls correctly', done => {
      const stream = (client as any).fooServerStream({
        id: 11,
        name: ['Foo stream']
      });
      stream.on('data', (data: FooTest.BarResponse) => {
        expect(data.result).toEqual('Foo stream');
      });
      stream.on('end', done);
    });

    it('logs request and response', done => {
      const stream = (client as any).fooServerStream({
        id: 11,
        name: ['Foo stream']
      });
      stream.on('data', (data: FooTest.BarResponse) => {
        expect(data.result).toEqual('Foo stream');
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
          'GRPC /TestSvc/FooServerStream',
          {
            path: '/TestSvc/FooServerStream',
            request: {
              id: 11,
              name: ['Foo stream']
            },
            response: 'STREAM'
          }
        );
      });

      stream.on('end', done);
    });
  });

  describe('bidi stream call', () => {
    const fooServerStreamMock = jest.fn(async call => {
      for await (const reqRaw of call as any) {
        const req: FooTest.FooRequest = reqRaw;
        call.write({ result: req.name![0] });
      }
      call.end();
    });

    beforeAll(() => {
      startService({
        foo: jest.fn(),
        fooServerStream: jest.fn(),
        fooClientStream: jest.fn(),
        fooBidiStream: fooServerStreamMock
      });
    });

    beforeEach(() => {
      fooServerStreamMock.mockClear();
    });

    it('calls correctly', done => {
      const stream = (client as any).fooBidiStream();
      stream.write({ id: 3, name: ['Bar'] });
      stream.end();
      stream.on('data', (data: FooTest.BarResponse) => {
        expect(data.result).toEqual('Bar');
      });
      stream.on('end', done);
    });
  });
});

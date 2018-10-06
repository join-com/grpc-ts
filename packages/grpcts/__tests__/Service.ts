import { Service } from '../src/Service';
import { FooTest } from './generated/foo/Foo';
import * as grpc from 'grpc';

let client: grpc.Client;
let server: grpc.Server;

const startService = (implementations: FooTest.TestSvcImplementation) => {
  const service = new Service<FooTest.TestSvcImplementation>(
    FooTest.testSvcServiceDefinition,
    implementations
  );

  server = new grpc.Server();
  server.addService(service.definitions, service.grpcImplementations);

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
          fooBieStream: jest.fn()
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

      describe('error', () => {
        beforeEach(() => {
          fooMock.mockImplementation(async () => {
            throw new Error('Something wrong');
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
            const err = JSON.parse(error.metadata.get('error'));
            expect(err.message).toEqual('Something wrong');
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
          fooBieStream: jest.fn()
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
          fooBieStream: jest.fn()
        });
      });

      beforeEach(() => {
        fooClientStreamMock.mockClear();
      });

      describe('success', () => {
        it('calls with correct attributes', done => {
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
              const err = JSON.parse(error.metadata.get('error'));
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
          fooBieStream: jest.fn()
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
});

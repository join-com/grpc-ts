import { Config, mockSvc } from '../src/mockSvc';
import { FooTest } from '../../grpcts/__tests__/generated/foo/Foo';

const serviceDefinitions = {
  test: FooTest.testSvcServiceDefinition
};

const config: Config<typeof serviceDefinitions> = {
  test: true
};

const host = '127.0.0.1:55555';

const client = new FooTest.TestSvcClient(host);

let closeClient = () => client.close();

const fooMocks = mockSvc(config, serviceDefinitions, host, closeClient);

describe('mockSvc', () => {
  it('creates a working service mock', async () => {
    const result: FooTest.IBarResponse = { result: '123' };
    fooMocks().test.foo.mockResolvedValue(result);

    const args: FooTest.IFooRequest = { id: 1, password: 'qwerty' };
    const response = await client.foo(args).res;

    expect(response).toEqual(result);
    expect(fooMocks().test.foo.mock.calls[0][0].request).toEqual(args);
  });
});

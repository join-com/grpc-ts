import { MockService } from './MockService';
import { Server } from '@join-com/grpc-ts';

type Mock<T> = {
  [P in keyof T]: T[P] & jest.Mock<any, any>;
};
type Object = {
  [key: string]: any;
};

export type Config<T> = {
  readonly [K in keyof T]?: true;
};
export type ServiceMock<T> = {
  readonly [K in keyof T]: Mock<T[K]>;
};
export type MockGetter<T> = () => ServiceMock<T>;

export const mockSvc = <T extends Object>(
  config: Config<T>,
  serviceDefinitions: T,
  serviceHost: string,
  closeClients: () => void
): MockGetter<T> => {
  let server: Server;
  let serviceMock: ServiceMock<T>;

  beforeAll(async () => {
    serviceMock = mockEnabledServices(config, serviceDefinitions);

    server = new Server();
    addMockServices(server, serviceDefinitions, serviceMock);
    await server.start(serviceHost);
  });

  afterAll(async () => {
    await server.tryShutdown();
    closeClients();
  });

  afterEach(() => {
    Object.values(serviceMock).forEach(resetDefinedMocks);
  });

  return () => serviceMock;
};

const mockEnabledServices = <T extends Object>(
  config: Config<T>,
  serviceDefinitions: T
): ServiceMock<T> =>
  enabledServices(config).reduce(
    (acc: ServiceMock<T>, service: keyof T) => ({
      ...acc,
      ...{ [service]: mockProperties(serviceDefinitions[service]) }
    }),
    {} as ServiceMock<T>
  );

const enabledServices = <T extends Object>(config: Config<T>): (keyof T)[] =>
  Object.entries(config)
    .filter(([_, v]) => Boolean(v))
    .map(([k]) => k as keyof T);

const addMockServices = <T extends Object>(
  server: Server,
  serviceDefinitions: T,
  serviceMock: ServiceMock<T>
) =>
  Object.entries(serviceMock)
    .map(
      ([service, mockedDefinition]) =>
        new MockService(serviceDefinitions[service], mockedDefinition as any)
    )
    .forEach(svc => server.addService(svc));

const resetDefinedMocks = <T extends Object>(o: Mock<T>) =>
  Object.values(o)
    .filter(Boolean)
    .forEach(m => m.mockReset());

const mockProperties = <O>(object: O): Mock<O> =>
  Object.keys(object).reduce(
    (acc: Mock<O>, curr: string) => ({ ...acc, [curr]: jest.fn() }),
    {} as Mock<O>
  );

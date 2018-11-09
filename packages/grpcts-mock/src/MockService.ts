import { Service, Implementations } from '@join-com/grpc-ts';
import jestMock from 'jest-mock';
import * as grpc from 'grpc';
import 'jest';

export interface MethodMock<T> extends jest.Mock<T> {
  mockResetOrigin: () => void;
}

export type MockImplementation<T> = { [P in keyof T]: MethodMock<T[keyof T]> };

interface ServiceClass<T extends Implementations> {
  new (implementations: T): Service<T>;
}

export class MockService<T extends Implementations> {
  public mocks: MockImplementation<T>;
  private wrappers: grpc.UntypedServiceImplementation = {};
  public service: Service<T>;

  constructor(
    private readonly serviceClass: ServiceClass<T>,
    private readonly implementations: T,
  ) {
    const mocks: any = {};
    const wrappers: any = {};
    Object.keys(this.implementations).forEach(key => {
      const mock = jestMock.fn(this.implementations[key]);
      mock.mockResetOrigin = () => {
        mock.mockReset();
        mock.mockImplementation(this.implementations[key]);
      };
      const wrapped = (request: any) => mock(request);
      mocks[key] = mock;
      wrappers[key] = wrapped;
    });
    this.mocks = mocks;
    this.wrappers = wrappers;
    this.service = new this.serviceClass(this.wrappers as any);
  }

  public wrappedImplementations(): grpc.UntypedServiceImplementation {
    return this.service.implementations;
  }

  public allMocksResetOrigin() {
    Object.keys(this.mocks).forEach(key => {
      this.mocks[key].mockResetOrigin();
    });
  }
}

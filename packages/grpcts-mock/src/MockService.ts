import { Service } from '@join-com/grpc-ts';
import * as jestMock from 'jest-mock';
import * as grpc from 'grpc';
import 'jest';

export type MockImplementation<T> = { [P in keyof T]: jest.Mock<T[keyof T]> };

interface ServicePlusClass<T> {
  new (implementations: T): Service<T>;
}

export class MockService<T extends any> {
  public mocks: MockImplementation<T>;
  private wrappers: grpc.UntypedServiceImplementation = {};
  private service: Service<T>;

  constructor(
    private readonly serviceClass: ServicePlusClass<T>,
    private readonly implementations: T,
  ) {
    const mocks: any = {};
    const wrappers: any = {};
    Object.keys(this.implementations).forEach(key => {
      const mock = jestMock.fn(this.implementations[key]);
      const wrapped = (request: any) => mock(request);
      mocks[key] = mock;
      wrappers[key] = wrapped;
    });
    this.mocks = mocks;
    this.wrappers = wrappers;
    this.service = new this.serviceClass(this.wrappers as any);
  }

  public wrappedImplementations(): grpc.UntypedServiceImplementation {
    return this.service.wrappedImplementations();
  }
}

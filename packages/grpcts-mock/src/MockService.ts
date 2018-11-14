import { Service, Implementations } from '@join-com/grpc-ts';
import * as grpc from 'grpc';

export class MockService<I extends Implementations> extends Service<I> {
  constructor(
    rawDefinitions: grpc.ServiceDefinition<any>,
    rawImplementations: Partial<I> = {},
  ) {
    const stubImplementations: I = Object.keys(rawDefinitions).reduce(
      (acc, key) => Object.assign(acc, { [key]: async () => ({}) }),
      {} as I,
    );
    super(
      rawDefinitions,
      Object.assign(stubImplementations, rawImplementations),
    );
  }
}

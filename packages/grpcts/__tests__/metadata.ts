import { toGRPCMetadata } from '../src/metadata';

describe('toGRPCMetadata', () => {
  it('converts object to grpc.Metadata', () => {
    const grpcMetadata = toGRPCMetadata({
      foo: 'bar',
      bar: 'foo'
    });
    expect(grpcMetadata.get('foo')).toEqual(['bar']);
    expect(grpcMetadata.get('bar')).toEqual(['foo']);
  });
});

import { Server } from '../src/Server';
import * as grpc from '@grpc/grpc-js';

describe('Server', () => {
  describe('start', () => {
    describe('when port is busy', () => {
      let server: Server;
      beforeEach(async () => {
        server = new Server(grpc.ServerCredentials.createInsecure());
        await server.start('0.0.0.0:0');
      });

      afterEach(() => server.tryShutdown());
      it('raises an error', async () => {
        await expect(
          server.start(`0.0.0.0:${server.port}`)
        ).rejects.toBeInstanceOf(Error);
      });
    });
  });
});

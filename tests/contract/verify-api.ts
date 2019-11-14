import 'mocha';
import './config/bootstrap';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { apiProviderChecker, PactBootstrap } from '@pe/pact-kit';

let app: NestFastifyApplication;

describe('Pact Verification', () => {
  before(async () => { app = await PactBootstrap.bootstrap() } );

  it(
    'should validate the expectations of all consumers',
    (done: (err?: any) => void) => {
      return apiProviderChecker(done);
    });

  after(async () => { await app.close() })
});

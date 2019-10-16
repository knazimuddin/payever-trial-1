import 'mocha';

import { Verifier, VerifierOptions } from '@pact-foundation/pact';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrap } from './bootstrap';
import { pactEnvironment } from './pact-environment';

let app: NestFastifyApplication;

describe('Pact Verification', () => {
  before(async () => { app = await bootstrap(); } );

  it('should validate the expectations of all consumers', (done: () => void) => {
    const options: VerifierOptions = {
      pactBrokerPassword: pactEnvironment.pactBroker.pactBrokerPassword,
      pactBrokerUrl: pactEnvironment.pactBroker.pactBroker,
      pactBrokerUsername: pactEnvironment.pactBroker.pactBrokerUsername,
      publishVerificationResult: true,
      ...pactEnvironment.provider,
    };

    new Verifier(options).verifyProvider()
      .then(() => done())
      .catch((err) => { throw err; });
  });

  after(async () => { await app.close() })
});

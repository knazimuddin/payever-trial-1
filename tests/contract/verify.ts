import 'mocha';
import './config/bootstrap';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PactBootstrap, asyncProviderChecker, PactAsyncMessagesCollector } from '@pe/pact-kit';

describe('Pact verification', () => {
  let app: NestFastifyApplication;
  let messagesProviders: any;
  before(async () => {
    app = await PactBootstrap.bootstrap();

    messagesProviders = await app.get(PactAsyncMessagesCollector).getMessageProviders();
  });

  it(
    `should validate the expectations of all consumers for messages`,
    (done: (err?: any) => void) => {
      asyncProviderChecker(done, messagesProviders);
    },
  );

  after(async () => { await app.close() })
});

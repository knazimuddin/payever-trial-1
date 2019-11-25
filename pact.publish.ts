import { Publisher } from '@pact-foundation/pact-node';
import { pactConfiguration } from './tests/contract/config';

(async (): Promise<void> => {
  const publisher: Publisher = new Publisher(pactConfiguration.pactBroker);
  await publisher.publish();
})();

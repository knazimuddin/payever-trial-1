import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../config';
import { RabbitRoutingKeys } from '../../../src/enums';
import {
  ShippingLabelDownloadedDto, ShippingOrderProcessedMessageDto,
  ShippingSlipDownloadedDto
} from '../../../src/transactions/dto';

const URL_REGEXP: string = '^http(s)?:\\/\\/.+';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      transactionId: Matchers.uuid(),
      trackingNumber: Matchers.like('12342355'),
      trackingUrl: Matchers.term({
        matcher: URL_REGEXP,
        generate: 'http://some.test.com/path-to-track?with_query=some_value',
      }),
    },
    dtoClass: ShippingOrderProcessedMessageDto,
    name: RabbitRoutingKeys.ShippingOrderProcessed,
  },
  {
    contentMatcher: {
      shippingOrder: {
        id: Matchers.uuid(),
      }
    },
    dtoClass: ShippingLabelDownloadedDto,
    name: RabbitRoutingKeys.ShippingLabelDownloaded,
  },
  {
    contentMatcher: {
      shippingOrder: {
        id: Matchers.uuid(),
      }
    },
    dtoClass: ShippingSlipDownloadedDto,
    name: RabbitRoutingKeys.ShippingSlipDownloaded,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.Shipping,
);

describe('Receive shipping bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

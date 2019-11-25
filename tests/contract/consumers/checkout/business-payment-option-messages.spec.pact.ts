import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../../config';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { BusinessPaymentOptionChangedDto } from '../../../../src/transactions/dto/checkout-rabbit';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      business_payment_option: {
        id: Matchers.like(1234),
        uuid: Matchers.uuid(),
        payment_option_id: Matchers.like(12),
        accept_fee: Matchers.like(true),
        status: Matchers.like('new'),
        fixed_fee: Matchers.like(0),
        variable_fee: Matchers.like(1),
        credentials: Matchers.like({}),
        options: Matchers.like('{some string}'),
        completed: Matchers.like(true),
        shop_redirect_enabled: Matchers.like(false),
      },
    },
    dtoClass: BusinessPaymentOptionChangedDto,
    name: RabbitRoutingKeys.BpoCreated,
  },
  {
    contentMatcher: {
      business_payment_option: {
        id: Matchers.like(1234),
        uuid: Matchers.uuid(),
        payment_option_id: Matchers.like(12),
        accept_fee: Matchers.like(true),
        status: Matchers.like('new'),
        fixed_fee: Matchers.like(0),
        variable_fee: Matchers.like(1),
        credentials: Matchers.like({}),
        options: Matchers.like('{some string}'),
        completed: Matchers.like(true),
        shop_redirect_enabled: Matchers.like(false),
      },
    },
    dtoClass: BusinessPaymentOptionChangedDto,
    name: RabbitRoutingKeys.BpoUpdated,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.Users,
);

describe('Receive checkout business payment option bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

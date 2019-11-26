import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../../config';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { TransactionChangedDto, TransactionRemovedDto } from '../../../../src/transactions/dto/checkout-rabbit';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      payment: {
        uuid: Matchers.uuid(),
      }
    },
    dtoClass: TransactionRemovedDto,
    name:  RabbitRoutingKeys.PaymentRemoved,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.CheckoutPhp,
);

describe('Receive checkout payment removed bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

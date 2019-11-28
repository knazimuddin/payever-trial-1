import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../../config';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { PaymentFlowChangedDto, PaymentFlowRemovedDto } from '../../../../src/transactions/dto/checkout-rabbit';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      flow: {
        id: Matchers.like('some_random_string'),
        amount: Matchers.like(10),
        shipping_fee: Matchers.like(12),
        tax_value: Matchers.like(0),
        step: Matchers.like('payment_step.initialize'),
      },
    },
    dtoClass: PaymentFlowChangedDto,
    name: RabbitRoutingKeys.PaymentFlowCreated
  },
  {
    contentMatcher: {
      flow: {
        id: Matchers.like('some_random_string'),
        amount: Matchers.like(10),
        shipping_fee: Matchers.like(12),
        tax_value: Matchers.like(0),
        step: Matchers.like('payment_step.initialize'),
      },
    },
    dtoClass: PaymentFlowChangedDto,
    name: RabbitRoutingKeys.PaymentFlowUpdated
  },
  {
    contentMatcher: {
      flow: {
        id: Matchers.like('some_random_string'),
        amount: Matchers.like(10),
        shipping_fee: Matchers.like(12),
        tax_value: Matchers.like(0),
        step: Matchers.like('payment_step.initialize'),
      },
    },
    dtoClass: PaymentFlowChangedDto,
    name: RabbitRoutingKeys.PaymentFlowMigrate
  },
  {
    contentMatcher: {
      flow: {
        id: Matchers.like('some_random_string'),
      },
    },
    dtoClass: PaymentFlowRemovedDto,
    name: RabbitRoutingKeys.PaymentFlowRemoved,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.CheckoutPhp,
);

describe('Receive checkout payment flow bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

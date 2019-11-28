import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../../config';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { ActionCompletedMessageDto } from '../../../../src/transactions/dto/payment-micro';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      action: Matchers.like('some-action-name'),
      payment: {
        uuid: Matchers.uuid(),
        id: Matchers.like('1234'),
      },
      data: {
        amount: Matchers.like(200),
        payment_status: Matchers.like('NEW'),
        reason: Matchers.like('Some reason'),
        items_restocked: Matchers.like(false),
        refund_items: Matchers.eachLike({
          payment_item_id: Matchers.like('payment_item_id'),
          count: Matchers.like(10),
        }),
        saved_data: Matchers.eachLike({
          type: Matchers.like('type'),
          name: Matchers.like('name'),
        }),
      },
    },
    dtoClass: ActionCompletedMessageDto,
    name: RabbitRoutingKeys.PaymentActionCompleted
  },
  {
    contentMatcher: {
      action: Matchers.like('some-action-name'),
      payment: {
        uuid: Matchers.uuid(),
        id: Matchers.like('1234'),
      },
      data: {
        amount: Matchers.like(200),
        payment_status: Matchers.like('NEW'),
        reason: Matchers.like('Some reason'),
        items_restocked: Matchers.like(false),
        refund_items: Matchers.eachLike({
          payment_item_id: Matchers.like('payment_item_id'),
          count: Matchers.like(10),
        }),
        saved_data: Matchers.eachLike({
          type: Matchers.like('type'),
          name: Matchers.like('name'),
        }),
      },
    },
    dtoClass: ActionCompletedMessageDto,
    name: RabbitRoutingKeys.PaymentHistoryAdd,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.PaymentSantanderDe,
);

describe('Receive santander de micro bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

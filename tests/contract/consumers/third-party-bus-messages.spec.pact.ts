import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../config';
import { RabbitRoutingKeys } from '../../../src/enums';
import { ThirdPartyActionRequestDto } from '../../../src/transactions/dto/third-party/third-party-action-request.dto';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      reference: Matchers.like('transaction_reference'),
      action: Matchers.like('capture'),
      business: {
        id: Matchers.uuid(),
      },
      integration: {
        name: Matchers.like('integration_name'),
      },
      fields: {},
    },
    dtoClass: ThirdPartyActionRequestDto,
    name: RabbitRoutingKeys.ThirdPartyPaymentActionRequested,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.ThirdParty,
);

describe('Receive third-party bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

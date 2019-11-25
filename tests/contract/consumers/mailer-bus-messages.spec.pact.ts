import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../config';
import { RabbitRoutingKeys } from '../../../src/enums';
import { PaymentMailSentDto } from '../../../src/transactions/dto';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      id: Matchers.uuid(),
      templateName: Matchers.like('some_template_name'),
      transactionId: Matchers.uuid(),
    },
    dtoClass: PaymentMailSentDto,
    name: RabbitRoutingKeys.MailerPaymentMailSent,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.Mailer,
);

describe('Receive mailer bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

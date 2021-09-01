import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../config';
import { BusinessDto, RemoveBusinessDto } from '@pe/business-kit';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      _id: Matchers.uuid(),
      currency: Matchers.like('EUR'),
      companyAddress: {
        country: Matchers.like('DE'),
        city: Matchers.like('Los Angeles'),
        street: Matchers.like('Beverly Hills'),
        zipCode: Matchers.like('90210'),
      },
      companyDetails: {
        product: Matchers.like('id'),
      },
      name: Matchers.like('Test business'),
    },
    dtoClass: BusinessDto,
    name: 'users.event.business.created',
  },
  {
    contentMatcher: {
      _id: Matchers.uuid(),
      currency: Matchers.like('EUR'),
      companyAddress: {
        country: Matchers.like('DE'),
        city: Matchers.like('Los Angeles'),
        street: Matchers.like('Beverly Hills'),
        zipCode: Matchers.like('90210'),
      },
      companyDetails: {
        product: Matchers.like('id'),
      },
      name: Matchers.like('Test business'),
    },
    dtoClass: BusinessDto,
    name: 'users.event.business.updated',
  },
  {
    contentMatcher: {
      _id: Matchers.uuid(),
      currency: Matchers.like('EUR'),
      companyAddress: {
        country: Matchers.like('DE'),
        city: Matchers.like('Los Angeles'),
        street: Matchers.like('Beverly Hills'),
        zipCode: Matchers.like('90210'),
      },
      companyDetails: {
        product: Matchers.like('id'),
      },
      name: Matchers.like('Test business'),
    },
    dtoClass: BusinessDto,
    name: 'users.event.business.export',
  },
  {
    contentMatcher: {
      _id: Matchers.uuid(),
    },
    dtoClass: RemoveBusinessDto,
    name: 'users.event.business.removed',
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.Users,
);

describe('Receive business bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});

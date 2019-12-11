import { PactConfigurationInterface } from '@pe/pact-kit';
import { SantanderPaymentWithPanIdState } from "../states";

import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppModule } from '../../../src/app.module'
import { MessagingServiceMock } from "../mocks";
import { MessagingService } from "../../../src/transactions/services";
import { StatisticsMessagesMock } from '../providers/transactions-messages.pact.mock';

dotenv.config();
const env: any = process.env;

const participantName: string = 'nodejs-backend-transactions';

env.PACT_CONSUMER_PORT = env.PACT_CONSUMER_PORT || '3005';

export const pactConfiguration: PactConfigurationInterface = {
  consumer: {
    consumer: participantName,
    consumerVersion: env.PACT_CONSUMER_VERSION,
    dir: path.resolve(process.cwd(), 'pacts'),
    log: path.resolve(process.cwd(), 'pact.log'),
    port: Number(env.PACT_CONSUMER_PORT),
    spec: 2,
  },
  options: {
    importModules: [AppModule],
    nestProvidersMocks: [
      {
        mockClass: MessagingServiceMock,
        providerToken: MessagingService,
      },
    ],
    providers: [],
    rabbitMessagesProviders: [
      StatisticsMessagesMock,
    ],
    states: [
      SantanderPaymentWithPanIdState,
    ],
  },
  pactBroker: {
    consumerVersion: env.PACT_CONSUMER_VERSION,
    pactBroker: env.PACT_BROKER_BASE_URL,
    pactBrokerPassword: env.PACT_BROKER_PASSWORD,
    pactBrokerUsername: env.PACT_BROKER_USERNAME,
    pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
    tags: env.PACT_ENV_TAGS ? env.PACT_ENV_TAGS.split(',').map((s: string) => s.trim()) : [],
  },
  provider: {
    dir: path.resolve(process.cwd(), 'pacts'),
    log: path.resolve(process.cwd(), 'pact.log'),
    port: Number(env.PACT_PROVIDER_PORT),
    provider: participantName,
    providerBaseUrl: `http://localhost:${env.PACT_PROVIDER_PORT}`,
    providerStatesSetupUrl: `http://localhost:${env.PACT_PROVIDER_PORT}/api/setup`,
    providerVersion: env.PACT_CONSUMER_VERSION,
  },
};

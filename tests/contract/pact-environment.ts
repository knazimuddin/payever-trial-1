import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
const env = process.env;

const participantName:string = 'nodejs-backend-transactions';

env.PACT_CONSUMER_PORT = env.PACT_CONSUMER_PORT || '3005';

export const pactEnvironment: any = {
  consumer: {
    consumer: participantName,
    port: Number(env.PACT_CONSUMER_PORT),
    dir: path.resolve(process.cwd(), 'pacts'),
    log: path.resolve(process.cwd(), 'pact.log'),
    spec: 2,
    consumerVersion: env.PACT_CONSUMER_VERSION,
  },
  pactBroker: {
    pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
    pactBroker: env.PACT_BROKER_URL,
    pactBrokerUsername: env.PACT_BROKER_USERNAME,
    pactBrokerPassword: env.PACT_BROKER_PASSWORD,
    tags: env.PACT_ENV_TAGS ? env.PACT_ENV_TAGS.split(',').map((s: string) => s.trim()) : [],
  },
  provider: {
    provider: participantName,
    providerBaseUrl: `http://localhost:${env.PACT_CONSUMER_PORT}`,
    providerStatesSetupUrl: `http://localhost:${env.PACT_CONSUMER_PORT}/api/setup`,
    providerVersion: env.PACT_CONSUMER_VERSION,
  },
};

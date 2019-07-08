import * as dotenv from 'dotenv';
import * as path from 'path';

import { rabbitMqQueues } from './rabbit-mq-queues';

dotenv.config();
const env = process.env;
const isNumeric = (n) => {
  return !isNaN(parseInt(n, 10)) && isFinite(n);
};

export const environment: any = {
  production: env.PRODUCTION_MODE === 'true',
  applicationName: env.APP_NAME,
  port: env.APP_PORT,
  mongodb: env.MONGODB_URL,
  connectMicroUrlBase: env.MICRO_URL_CONNECT,
  statusPort: env.STATUS_APP_PORT,
  stub: env.STUB === 'true',
  elasticSearch: env.ELASTIC_HOST,
  redis: {
    url: env.REDIS_URL,
    retryAttempts: env.REDIS_RETRY_ATTEMPTS,
    retryDelay: env.REDIS_RETRY_DELAY,
  },
  refreshTokenExpiresIn: (
    isNumeric(env.JWT_REFRESH_TOKEN_EXPIRES_IN)
      ? parseInt(env.JWT_REFRESH_TOKEN_EXPIRES_IN, 10)
      : env.JWT_REFRESH_TOKEN_EXPIRES_IN
  ),
  jwtOptions: {
    // this should be set to PEM encoded private key for RSA/ECDSA for production
    // @see https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    secretOrPrivateKey: env.JWT_SECRET_TOKEN,
    signOptions: {
      expiresIn: (
        isNumeric(env.JWT_EXPIRES_IN)
          ? parseInt(env.JWT_EXPIRES_IN, 10)
          : env.JWT_EXPIRES_IN
      ),
    },
  },
  rabbitmq: {
    urls: [env.RABBITMQ_URL],
    queues: rabbitMqQueues,
    exchanges: [
      {
        name: 'async_events',
        type: 'direct',
        options: { durable: true },
      },
    ],
    prefetchCount: 1,
    isGlobalPrefetchCount: false,
  },
  rsa: {
    private: path.resolve(env.RABBITMQ_CERTIFICATE_PATH),
  },
  apm: {
    enable: env.APM_SERVICE_ENABLE === 'true',
    options: {
      active: env.ELASTIC_APM_ACTIVE,
      serverUrl: env.ELASTIC_APM_SERVER_URL,
      logLevel: env.ELASTIC_APM_LOG_LEVEL,
      serviceName: env.ELASTIC_APM_SERVICE_NAME,
    },
  },
};

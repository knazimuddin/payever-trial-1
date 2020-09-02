import * as dotenv from 'dotenv';
import * as path from 'path';
import ProcessEnv = NodeJS.ProcessEnv;

dotenv.config();
const env: ProcessEnv = process.env;
const isNumeric: (n: any) => boolean = (n: any): boolean => {
  return !isNaN(parseInt(n, 10)) && isFinite(n);
};

export const environment: any = {
  apm: {
    enable: env.APM_SERVICE_ENABLE === 'true',
    options: {
      active: env.ELASTIC_APM_ACTIVE,
      logLevel: env.ELASTIC_APM_LOG_LEVEL,
      serverUrl: env.ELASTIC_APM_SERVER_URL,
      serviceName: env.ELASTIC_APM_SERVICE_NAME,
    },
  },
  appCors: env.APP_CORS === 'true',
  applicationName: env.APP_NAME,
  connectMicroUrlBase: env.MICRO_URL_CONNECT,
  defaultCurrency: env.DEFAULT_CURRENCY,
  elasticSearch: env.ELASTIC_HOST,
  jwtOptions: {
    // this should be set to PEM encoded private key for RSA/ECDSA for production
    // @see https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    secret: env.JWT_SECRET_TOKEN,
    signOptions: {
      expiresIn: (
        isNumeric(env.JWT_EXPIRES_IN)
        ? parseInt(env.JWT_EXPIRES_IN, 10)
        : env.JWT_EXPIRES_IN
      ),
    },
  },
  microUrlMedia: env.MICRO_URL_MEDIA,
  mongodb: env.MONGODB_URL,
  port: env.APP_PORT,
  production: env.PRODUCTION_MODE === 'true',
  rabbitmq: {
    managementUrl: env.RABBITMQ_MANAGEMENT_URL,
    urls: [env.RABBITMQ_URL],
    vhost: env.RABBITMQ_VHOST,

    isGlobalPrefetchCount: false,
    prefetchCount: 1,
    rsa: {
      private: path.resolve(env.RABBITMQ_CERTIFICATE_PATH),
    },

    exchanges: [
      {
        name: 'async_events',
        options: { durable: true },
        type: 'direct',

        queues: [
          {
            name: 'async_events_transactions_micro',
            options: {
              deadLetterExchange: 'async_events_fallback',
              deadLetterRoutingKey: 'async_events_transactions_micro',
              durable: true,
            },
          },
        ],
      },
    ],
  },
  redis: {
    retryAttempts: env.REDIS_RETRY_ATTEMPTS,
    retryDelay: env.REDIS_RETRY_DELAY,
    url: env.REDIS_URL,
  },
  refreshTokenExpiresIn: (
    isNumeric(env.JWT_REFRESH_TOKEN_EXPIRES_IN)
    ? parseInt(env.JWT_REFRESH_TOKEN_EXPIRES_IN, 10)
    : env.JWT_REFRESH_TOKEN_EXPIRES_IN
  ),
  rsa: {
    private: path.resolve(env.RABBITMQ_CERTIFICATE_PATH),
  },
  statusPort: env.STATUS_APP_PORT,
  stub: env.STUB === 'true',
  thirdPartyPaymentsMicroUrl: env.MICRO_URL_THIRD_PARTY_PAYMENTS,
  webSocket: {
    port: env.WS_PORT,
  },
};

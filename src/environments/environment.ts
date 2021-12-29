import * as dotenv from 'dotenv';
import * as path from 'path';
import { RabbitChannels, RabbitExchangesEnum } from '../enums';
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
      centralConfig: env.ELASTIC_APM_CENTRAL_CONFIG,
      logLevel: env.ELASTIC_APM_LOG_LEVEL,
      serverUrl: env.ELASTIC_APM_SERVER_URL,
      serviceName: env.ELASTIC_APM_SERVICE_NAME,
    },
  },
  appCors: env.APP_CORS === 'true',
  applicationName: env.APP_NAME,
  connectMicroUrlBase: env.MICRO_URL_CONNECT,
  defaultCurrency: env.DEFAULT_CURRENCY,
  elasticSearchAuthPassword: env.ELASTIC_AUTH_PASSWORD,
  elasticSearchAuthUsername: env.ELASTIC_AUTH_USERNAME,
  elasticSearchCloudId: env.ELASTIC_CLOUD_ID,
  elasticSearchHost: env.ELASTIC_HOST,
  jwtOptions: {
    // this should be set to PEM encoded private key for RSA/ECDSA for production
    // @see https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    jwtKeyExtractorOptions: {
      authScheme: env.JWT_AUTH_SCHEME,
      tokenQueryParameterName: env.JWT_PARAM_NAME,
    },
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
        name: RabbitExchangesEnum.asyncEvents,
        options: { durable: true },
        type: 'direct',

        queues: [
          {
            name: RabbitChannels.Transactions,
            options: {
              deadLetterExchange: 'async_events_fallback',
              deadLetterRoutingKey: RabbitChannels.Transactions,
              durable: true,
            },
          },
        ],
      },
      {
        name: RabbitExchangesEnum.transactionsFolders,
        options: { durable: true },
        type: 'direct',

        queues: [
          {
            name: RabbitChannels.TransactionsFolders,
            options: {
              deadLetterExchange: 'transactions_folders_fallback',
              deadLetterRoutingKey: RabbitChannels.TransactionsFolders,
              durable: true,
            },
          },
        ],
      },
      {
        name: RabbitExchangesEnum.transactionsExport,
        options: { durable: true },
        type: 'direct',

        queues: [
          {
            name: RabbitChannels.TransactionsExport,
            options: {
              deadLetterExchange: 'transactions_export_fallback',
              deadLetterRoutingKey: RabbitChannels.TransactionsExport,
              durable: true,
            },
          },
        ],
      },
    ],
  },
  redis: {
    connect_timeout: env.REDIS_CONNECT_TIMEOUT,
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
    wsMicro: env.MICRO_WS_TRANSACTIONS,
  },

  exportTransactionsCountDirectLimitAdmin: env.EXPORT_TRANSACTIONS_COUNT_DIRECT_LIMIT_ADMIN ?
    env.EXPORT_TRANSACTIONS_COUNT_DIRECT_LIMIT_ADMIN : 10000,
  exportTransactionsCountDirectLimitMerchant: env.EXPORT_TRANSACTIONS_COUNT_DIRECT_LIMIT_MERCHANT ?
    env.EXPORT_TRANSACTIONS_COUNT_DIRECT_LIMIT_MERCHANT : 2000,
};

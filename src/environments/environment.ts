import * as dotenv from 'dotenv';
import * as path from 'path';

import { RabbitRoutingKeys } from '../enums';

dotenv.config();
const env = process.env;
const isNumeric = (n) => {
  return !isNaN(parseInt(n, 10)) && isFinite(n);
};

export const environment: any = {
  production: env.PRODUCTION_MODE === 'true',
  port: env.APP_PORT,
  mongodb: env.MONGODB_URL,
  connectMicroUrlBase: env.MICRO_URL_CONNECT,

  stub: env.STUB === 'true',
  refreshTokenExpiresIn: (isNumeric(env.JWT_REFRESH_TOKEN_EXPIRES_IN) ?
    parseInt(env.JWT_REFRESH_TOKEN_EXPIRES_IN, 10) :
    env.JWT_REFRESH_TOKEN_EXPIRES_IN),
  jwtOptions: {
    // this should be set to PEM encoded private key for RSA/ECDSA for production
    // @see https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    secretOrPrivateKey: env.JWT_SECRET_TOKEN,
    signOptions: {
      expiresIn: (isNumeric(env.JWT_EXPIRES_IN) ?
        parseInt(env.JWT_EXPIRES_IN, 10) :
        env.JWT_EXPIRES_IN),
    },
  },
  rabbitmq: {
    urls: [env.RABBITMQ_URL],
    queues: [
      {
        name: 'rpc_payment_santander_de',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_santander_invoice_de',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_factoring_de',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_santander_no',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_santander_dk',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_santander_se',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_sofort',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_paypal',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_stripe',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_payment_stub_proxy',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'rpc_checkout_micro',
        options: { autoDelete: true, durable: false },
        rpc: true,
      },
      {
        name: 'async_events_transactions_micro',
        options: {
          durable: true,
          deadLetterExchange: 'async_events_fallback',
        },
        bindings: [
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentActionCompleted,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentHistoryAdd,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentUpdated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentCreated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentRemoved,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentMigrate,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.BpoCreated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.BpoUpdated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentFlowCreated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentFlowUpdated,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentFlowRemoved,
          },
          {
            source: 'async_events',
            routingKey: RabbitRoutingKeys.PaymentFlowMigrate,
          },
        ],
      },
    ],
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

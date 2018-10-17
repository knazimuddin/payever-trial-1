import * as path from 'path';

export const environment: any = {
  production: false,
  port: 3040,
  mysql: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'admin4mysql',
    database: 'payever_dev',
  },
  // mongodb: 'mongodb://localhost:27017/transactions',
  mongodb: 'mongodb://stage-mongo:ANUza5qvv0PyVEguriBWKtNmTVOsSWn8Cm8HhHlhir0CmRvJIJ1NsFomoBUWZVmqQgkwA4UEeUBEmuz7uQvIlw%3D%3D@stage-mongo.documents.azure.com:10255/transactions?ssl=true&replicaSet=globaldb',
  checkoutMicroUrlBase: 'https://showroom100.payever.de/',

  stub: true,

  rabbitmq: {
    urls: ['amqp://payever:Iengeaboo2TuKeiz0gie@showroom100.payever.de:5672/paf'],
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
          deadLetterExchange: 'async_events_callback',
          deadLetterRoutingKey: 'async_events_transactions_micro',
        },
        bindings: [
          {
            source: 'async_events',
            routingKey: 'payever.event.payment.action.completed',
          },
          {
            source: 'async_events',
            routingKey: 'payever.microservice.payment.history.add',
          },
          {
            source: 'async_events',
            routingKey: 'payever.event.payment.updated',
          },
          {
            source: 'async_events',
            routingKey: 'payever.event.payment.created',
          },
          {
            source: 'async_events',
            routingKey: 'payever.event.payment.removed',
          },
          {
            source: 'async_events',
            routingKey: 'payever.event.payment.migrate',
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
    private: path.resolve('./rabbitcrypt/private/private.crt'),
  },

};

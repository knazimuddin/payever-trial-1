import * as path from 'path';

export const environment: any = {
  production: true,
  port: 3000,
  mysql: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
  },
  mongodb: 'SED_MONGO_URL',
  checkoutMicroUrlBase: 'https://showroom63.payever.de/',

  rabbitmq: {
    // urls: ['amqp://guest:guest@localhost'],
    urls: ['SED_RABBITMQ_URL'],
    queue: 'rpc_payment_santander_de',
    // queue: 'rpc_queue',
    prefetchCount: 0,
    isGlobalPrefetchCount: false,
    queueOptions: { autoDelete: true, durable: false },
    // queueOptions: { autoDelete: false, durable: false },
  },

  rsa: {
    private: path.resolve('./rabbitcrypt/private/private.crt'),
  },
};

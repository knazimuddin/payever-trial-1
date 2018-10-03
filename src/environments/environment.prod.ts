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
  mongodb: 'mongodb://stage-mongo:ANUza5qvv0PyVEguriBWKtNmTVOsSWn8Cm8HhHlhir0CmRvJIJ1NsFomoBUWZVmqQgkwA4UEeUBEmuz7uQvIlw%3D%3D@stage-mongo.documents.azure.com:10255/transactions?ssl=true&replicaSet=globaldb',
  checkoutMicroUrlBase: 'https://showroom63.payever.de/',

  rabbitmq: {
    // urls: ['amqp://guest:guest@localhost'],
    urls: ['amqp://payever:Iengeaboo2TuKeiz0gie@showroom63.payever.de/paf'],
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

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
const env = process.env;

export const environment: any = {
    production: env.PRODUCTION_MODE === 'true',
    port: env.APP_PORT,
    mongodb: env.MONGODB_URL,
    checkoutMicroUrlBase: env.MICRO_URL_OLD_CHECKOUT,

    stub: env.STUB === 'true',

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
        private: path.resolve(env.RABBITMQ_CERTIFICATE_PATH),
    },
};

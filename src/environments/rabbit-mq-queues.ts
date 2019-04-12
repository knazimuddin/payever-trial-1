import { rabbitMqBindings } from './rabbit-mq-bindings';

export const rabbitMqQueues = [
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
      ...rabbitMqBindings,
    ],
  },
];

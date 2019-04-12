import { RabbitRoutingKeys } from '../enums';

export const rabbitMqBindings: any = [
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
];

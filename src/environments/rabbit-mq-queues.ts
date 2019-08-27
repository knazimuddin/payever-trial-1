import { RabbitMqQueueConfigInterface } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../enums';
import { CommonModelsNamesEnum, commonSdkRabbitMqBindings } from '@pe/common-sdk';

export const rabbitMqQueues: RabbitMqQueueConfigInterface[] = [
  {
    name: 'async_events_transactions_micro',
    options: {
      deadLetterExchange: 'async_events_fallback',
      durable: true,
    },

    bindings: [
      {
        routingKey: RabbitRoutingKeys.PaymentActionCompleted,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentHistoryAdd,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentUpdated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentCreated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentRemoved,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentMigrate,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BpoCreated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BpoUpdated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentFlowCreated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentFlowUpdated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentFlowRemoved,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentFlowMigrate,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.CodeUpdated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.ThirdPartyPaymentActionRequested,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.PaymentSubmitted,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BusinessExport,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BusinessUpdated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BusinessCreated,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.BusinessRemoved,
        source: 'async_events',
      },
      {
        routingKey: RabbitRoutingKeys.ShippingOrderProcessed,
        source: 'async_events',

      },
      commonSdkRabbitMqBindings.get(CommonModelsNamesEnum.CurrencyModel),
    ],
  },
];

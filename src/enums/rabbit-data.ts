export enum RabbitChannels {
  Transactions = 'async_events_transactions_micro',
}

export enum RabbitRoutingKeys {
  PaymentActionCompleted = 'payever.event.payment.action.completed',
  PaymentHistoryAdd = 'payever.microservice.payment.history.add',
  PaymentCreated = 'checkout.event.payment.created',
  PaymentUpdated = 'checkout.event.payment.updated',
  PaymentRemoved = 'checkout.event.payment.removed',
  PaymentMigrate = 'checkout.event.payment.migrate',

  BpoCreated = 'checkout.event.business-payment-option.created',
  BpoUpdated = 'checkout.event.business-payment-option.updated',

  PaymentFlowCreated = 'checkout.event.payment-flow.created',
  PaymentFlowUpdated = 'checkout.event.payment-flow.updated',
  PaymentFlowRemoved = 'checkout.event.payment-flow.removed',
  PaymentFlowMigrate = 'checkout.event.payment-flow.migrate',
}

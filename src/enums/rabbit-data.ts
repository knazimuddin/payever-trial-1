export enum RabbitRoutingKeys {
  PaymentActionCompleted = 'payever.event.payment.action.completed',
  PaymentHistoryAdd = 'payever.microservice.payment.history.add',
  PaymentCreated = 'payever.event.payment.created',
  PaymentUpdated = 'payever.event.payment.updated',
  PaymentRemoved = 'payever.event.payment.removed',
  PaymentMigrate = 'payever.event.payment.migrate',

  // Draft
  BpoCreated = 'checkout.event.business-payment-option.created',
  BpoUpdated = 'checkout.event.business-payment-option.updated',

  PaymentFlowCreated = 'payever.event.payment_flow.created',
  PaymentFlowUpdated = 'payever.event.payment_flow.updated',
  PaymentFlowRemoved = 'payever.event.payment_flow.removed',
}

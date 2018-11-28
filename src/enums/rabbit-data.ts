export enum RabbitRoutingKeys {
  PaymentActionCompleted = 'payever.event.payment.action.completed',
  PaymentHistoryAdd = 'payever.microservice.payment.history.add',
  PaymentCreated = 'checkout.event.payment.created',
  PaymentUpdated = 'checkout.event.payment.updated',
  PaymentRemoved = 'checkout.event.payment.removed',
  PaymentMigrate = 'checkout.event.payment.migrate',

  // Draft
  BpoCreated = 'checkout.event.business-payment-option.created',
  BpoUpdated = 'checkout.event.business-payment-option.updated',

  PaymentFlowCreated = 'payever.event.payment_flow.created',
  PaymentFlowUpdated = 'payever.event.payment_flow.updated',
  PaymentFlowRemoved = 'payever.event.payment_flow.removed',
}

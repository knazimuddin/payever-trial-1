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
  PaymentSubmitted = 'checkout.event.payment.submitted',

  BpoCreated = 'checkout.event.business-payment-option.created',
  BpoUpdated = 'checkout.event.business-payment-option.updated',

  PaymentFlowCreated = 'checkout.event.payment-flow.created',
  PaymentFlowUpdated = 'checkout.event.payment-flow.updated',
  PaymentFlowRemoved = 'checkout.event.payment-flow.removed',
  PaymentFlowMigrate = 'checkout.event.payment-flow.migrate',

  TransactionsPaymentAdd = 'transactions.event.payment.add',
  TransactionsPaymentSubtract = 'transactions.event.payment.subtract',
  TransactionsPaymentRemoved = 'transactions.event.payment.removed',

  ThirdPartyPaymentActionRequested = 'third-party.event.payment.action',

  ShippingOrderProcessed = 'shipping.event.shipping-order.processed',
  ShippingLabelDownloaded = 'shipping.event.shipping-label.downloaded',
  ShippingSlipDownloaded = 'shipping.event.shipping-slip.downloaded',

  BusinessExport = 'users.event.business.export',
  BusinessUpdated = 'users.event.business.updated',
  BusinessCreated = 'users.event.business.created',
  BusinessRemoved = 'users.event.business.removed',

  MailerPaymentMailSent = 'mailer.event.payment-mail.sent',

  GetSellerName = 'auth.commands.get_user_data',
  SellerNamePropagated = 'auth.event.propagate_user_data',

  MailerReportDailyReportRequested = 'mailer-report.event.daily-report-data.requested',
}

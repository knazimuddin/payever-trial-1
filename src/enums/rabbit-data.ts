export enum RabbitExchangesEnum {
  asyncEvents = 'async_events',
  transactionsFolders = 'transactions_folders',
  transactionsExport = 'transactions_export',
}

export enum RabbitChannels {
  Transactions = 'async_events_transactions_micro',
  TransactionsFolders = 'async_events_transactions_folders_micro',
  TransactionsExport = 'async_events_transactions_export_micro',
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
  BpoMigrate = 'checkout.event.business-payment-option.migrate',

  PaymentFlowCreated = 'checkout.event.payment-flow.created',
  PaymentFlowUpdated = 'checkout.event.payment-flow.updated',
  PaymentFlowRemoved = 'checkout.event.payment-flow.removed',
  PaymentFlowMigrate = 'checkout.event.payment-flow.migrate',

  /** @deprecated */
  TransactionsPaymentAdd = 'transactions.event.payment.add',
  TransactionsPaymentPaid = 'transactions.event.payment.paid',
  TransactionsPaymentRefund = 'transactions.event.payment.refund',
  /** @deprecated */
  TransactionsPaymentSubtract = 'transactions.event.payment.subtract',
  TransactionsPaymentRemoved = 'transactions.event.payment.removed',
  TransactionsMigrate = 'transactions.event.payment.migrate',

  InternalTransactionPaymentRefund = 'transactions.event.payment.refund.internal',

  ThirdPartyPaymentActionRequested = 'third-party.event.payment.action',

  ShippingOrderProcessed = 'shipping.event.shipping-order.processed',
  ShippingLabelDownloaded = 'shipping.event.shipping-label.downloaded',
  ShippingSlipDownloaded = 'shipping.event.shipping-slip.downloaded',

  BusinessExport = 'users.event.business.export',
  BusinessUpdated = 'users.event.business.updated',
  BusinessCreated = 'users.event.business.created',
  BusinessRemoved = 'users.event.business.removed',

  MailerPaymentMailSent = 'mailer.event.payment-mail.sent',
  PayeverEventUserEmail = 'payever.event.user.email',

  GetSellerName = 'auth.commands.get_user_data',
  SellerNamePropagated = 'auth.event.propagate_user_data',

  MailerReportDailyReportRequested = 'mailer-report.event.transactions-daily.request',

  ExportMonthlyBusinessTransaction = 'transactions.event.export.monthly-business-transaction',
  ExportMonthlyUserPerBusinessTransaction = 'transactions.event.export.monthly-user-per-business-transaction',
  ExportTotalUserPerBusinessTransaction = 'transactions.event.export.total-user-per-business-transaction',

  InternalTransactionExport = 'transactions.event.export',

}

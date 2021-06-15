export enum PaymentSpecificStatusEnum {
  new = 'STATUS_NEW',
  inProcess = 'STATUS_IN_PROCESS',
  accepted = 'STATUS_ACCEPTED',
  paid = 'STATUS_PAID',
  declined = 'STATUS_DECLINED',
  refunded = 'STATUS_REFUNDED',
  failed = 'STATUS_FAILED',
  canceled = 'STATUS_CANCELLED',
  invoiceCancellation = 'STATUS_INVOICE_CANCELLATION',
  invoiceIncollection = 'STATUS_INVOICE_INCOLLECTION',
  invoiceLatepayment = 'STATUS_INVOICE_LATEPAYMENT',
  invoiceReminder = 'STATUS_INVOICE_REMINDER',
  santanderInProgress = 'STATUS_SANTANDER_IN_PROGRESS',
  santanderInProcess = 'STATUS_SANTANDER_IN_PROCESS',
  santanderDeclined = 'STATUS_SANTANDER_DECLINED',
  santanderApproved = 'STATUS_SANTANDER_APPROVED',
  santanderApprovedWithRequirements = 'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
  santanderDeferred = 'STATUS_SANTANDER_DEFERRED',
  santanderCanceled = 'STATUS_SANTANDER_CANCELLED',
  santanderAutomaticDecline = 'STATUS_SANTANDER_AUTOMATIC_DECLINE declined',
  santanderInDecision = 'STATUS_SANTANDER_IN_DECISION',
  santanderDecisionNextWorkingDay = 'STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY',
  santanderInCancellation = 'STATUS_SANTANDER_IN_CANCELLATION',
  santanderAccountOpened = 'STATUS_SANTANDER_ACCOUNT_OPENED',
  santanderCanceledAnother = 'STATUS_SANTANDER_CANCELLED_ANOTHER',
  santanderShopTemporaryApproved = 'STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED',
}

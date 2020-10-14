export enum PaymentActionEventEnum {
  // this event is emitted after receiving rabbit event from payment micro (payment action completed)
  PaymentActionCompleted = 'payment-action.completed',

  // this event is emitted before executing payment action
  PaymentActionBefore = 'payment-action.before',

  // this event is emitted right after successful payment action execution
  PaymentActionAfter = 'payment-action.after',
}

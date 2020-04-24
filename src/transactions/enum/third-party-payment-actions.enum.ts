import { PaymentActionsEnum } from './payment-actions.enum';

export enum ThirdPartyPaymentActionsEnum {
  actionList = 'action-list',
  actionCancel = 'action-cancel',
  actionCapture = 'action-capture',
  actionRefund = 'action-refund',
  actionShippingGoods = 'action-shipping-goods',
}

export const TransactionActionsToThirdPartyActions: Map<string, string> = new Map<string, string>([
  [PaymentActionsEnum.Return, ThirdPartyPaymentActionsEnum.actionRefund],
  [PaymentActionsEnum.Refund, ThirdPartyPaymentActionsEnum.actionRefund],
  [PaymentActionsEnum.Authorize, ThirdPartyPaymentActionsEnum.actionCapture],
  [PaymentActionsEnum.Capture, ThirdPartyPaymentActionsEnum.actionCapture],
  [PaymentActionsEnum.ShippingGoods, ThirdPartyPaymentActionsEnum.actionShippingGoods],
  [PaymentActionsEnum.Cancel, ThirdPartyPaymentActionsEnum.actionCancel],
]);

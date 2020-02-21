import { PaymentActionsEnum } from './payment-actions.enum';

export enum ThirdPartyPaymentActionsEnum {
  actionList = 'action-list',
  actionCapture = 'action-capture',
  actionRefund = 'action-refund',
  actionShippingGoods = 'action-shipping-goods',
}

export const TransactionActionsToThirdPartyActions: Map<string, string> = new Map<string, string>([
  [PaymentActionsEnum.Refund, ThirdPartyPaymentActionsEnum.actionRefund],
  [PaymentActionsEnum.Authorize, ThirdPartyPaymentActionsEnum.actionCapture],
  [PaymentActionsEnum.ShippingGoods, ThirdPartyPaymentActionsEnum.actionShippingGoods],
]);

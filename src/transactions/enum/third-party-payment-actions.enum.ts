import { PaymentActionsEnum } from './payment-actions.enum';

export enum ThirdPartyPaymentActionsEnum {
  actionList = 'action-list',
  actionOptions = 'action-options',
  actionCancel = 'action-cancel',
  actionCapture = 'action-capture',
  actionEdit = 'action-edit',
  actionRefund = 'action-refund',
  actionShippingGoods = 'action-shipping-goods',
  actionVerify = 'action-verify',
  actionUpdateStatus = 'update-status',
}

export const TransactionActionsToThirdPartyActions: Map<string, string> = new Map<string, string>([
  [PaymentActionsEnum.Return, ThirdPartyPaymentActionsEnum.actionRefund],
  [PaymentActionsEnum.Refund, ThirdPartyPaymentActionsEnum.actionRefund],
  [PaymentActionsEnum.Authorize, ThirdPartyPaymentActionsEnum.actionCapture],
  [PaymentActionsEnum.Capture, ThirdPartyPaymentActionsEnum.actionCapture],
  [PaymentActionsEnum.ShippingGoods, ThirdPartyPaymentActionsEnum.actionShippingGoods],
  [PaymentActionsEnum.Cancel, ThirdPartyPaymentActionsEnum.actionCancel],
  [PaymentActionsEnum.Edit, ThirdPartyPaymentActionsEnum.actionEdit],
  [PaymentActionsEnum.Verify, ThirdPartyPaymentActionsEnum.actionVerify],
]);

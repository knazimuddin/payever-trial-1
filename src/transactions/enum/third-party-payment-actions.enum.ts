import { PaymentActionsEnum } from './payment-actions.enum';

export enum ThirdPartyPaymentActionsEnum {
  actionList = 'action-list',
  actionOptions = 'action-options',
  actionCancel = 'action-cancel',
  actionCapture = 'action-capture',
  actionEdit = 'action-edit',
  actionEditDelivery = 'action-edit-delivery',
  actionEditReference = 'action-edit-reference',
  actionRefund = 'action-refund',
  actionSendSigningLink = 'action-send-signing-link',
  actionShippingGoods = 'action-shipping-goods',
  actionVerify = 'action-verify',
  actionUpload = 'action-upload',
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
  [PaymentActionsEnum.EditDelivery, ThirdPartyPaymentActionsEnum.actionEditDelivery],
  [PaymentActionsEnum.EditReference, ThirdPartyPaymentActionsEnum.actionEditReference],
  [PaymentActionsEnum.Verify, ThirdPartyPaymentActionsEnum.actionVerify],
  [PaymentActionsEnum.Upload, ThirdPartyPaymentActionsEnum.actionUpload],
  [PaymentActionsEnum.SendSigningLink, ThirdPartyPaymentActionsEnum.actionSendSigningLink],
]);

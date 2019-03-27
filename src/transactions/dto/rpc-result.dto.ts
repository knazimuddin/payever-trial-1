import {
  CheckoutPaymentDetailsAwareInterface,
  CheckoutTransactionCartItemInterface,
  CheckoutTransactionInterface,
} from '../interfaces';

export class RpcResultDto implements CheckoutPaymentDetailsAwareInterface {
  public payment: CheckoutTransactionInterface;
  public payment_items: CheckoutTransactionCartItemInterface[];
  public payment_details: {
    finance_id: string,
    application_no: string,
    application_number: string,
  };
  public workflow_state: string;
}

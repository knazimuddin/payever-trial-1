import { UnpackedDetailsAwareInterface } from '../interfaces/awareness';
import { CheckoutTransactionCartItemInterface, CheckoutTransactionInterface } from '../interfaces/checkout';

export class RpcResultDto implements UnpackedDetailsAwareInterface {
  public payment: CheckoutTransactionInterface;
  public payment_items: CheckoutTransactionCartItemInterface[];
  public payment_details: {
    finance_id: string,
    application_no: string,
    application_number: string,
  };
  public workflow_state: string;
}

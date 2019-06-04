import { TransactionCartItemInterface } from '../transaction';

export interface CheckoutTransactionCartItemInterface extends TransactionCartItemInterface {
  product_uuid?: string;
}

import { TransactionCartItemInterface } from './transaction-cart-item.interface';

export interface CheckoutTransactionCartItemInterface extends TransactionCartItemInterface {
  product_uuid: string;
}

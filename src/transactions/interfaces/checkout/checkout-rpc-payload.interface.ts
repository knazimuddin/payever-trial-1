import { CheckoutTransactionRpcActionInterface } from './checkout-transaction-rpc-action.interface';

export interface CheckoutRpcPayloadInterface {
  action: string;
  data: CheckoutTransactionRpcActionInterface;
}

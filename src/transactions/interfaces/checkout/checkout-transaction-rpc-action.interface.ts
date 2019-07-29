import { ActionPayloadInterface } from '../action-payload';
import { UnpackedDetailsAwareInterface } from '../awareness';
import { PaymentFlowInterface } from '../payment-flow.interface';
import { TransactionCartItemInterface } from '../transaction';
import { CheckoutTransactionInterface } from './checkout-transaction.interface';

export interface CheckoutTransactionRpcActionInterface extends UnpackedDetailsAwareInterface, ActionPayloadInterface {
  action?: string;
  payment: CheckoutTransactionInterface;
  business: {
    id: string,
  };
  payment_flow?: PaymentFlowInterface;
  credentials?: object;
  payment_items?: TransactionCartItemInterface[];
}

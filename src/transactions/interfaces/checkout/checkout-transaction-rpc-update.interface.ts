import { SantanderApplicationAwareInterface } from '../awareness';

export interface CheckoutTransactionRpcUpdateInterface extends SantanderApplicationAwareInterface {
  amount?: number;
  delivery_fee?: number;
  payment_details?: string;
  place?: string;
  specific_status?: string;
  status?: string;
  reference?: string;
}

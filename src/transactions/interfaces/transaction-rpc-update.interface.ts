import { TransactionSantanderApplicationAwareInterface } from './index';

export interface TransactionRpcUpdateInterface extends TransactionSantanderApplicationAwareInterface {
  amount?: number;
  delivery_fee?: number;
  payment_details?: string;
  place?: string;
  specific_status?: string;
  status?: string;
}

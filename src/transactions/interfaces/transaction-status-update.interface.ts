import { TransactionInterface } from './transaction.interface';

export interface TransactionStatusUpdateInterface extends TransactionInterface {
  actions: string[];
}

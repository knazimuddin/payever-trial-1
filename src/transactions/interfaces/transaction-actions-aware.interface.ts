import { TransactionInterface } from './transaction.interface';

export interface TransactionActionsAwareInterface extends TransactionInterface {
  actions: string[];
}

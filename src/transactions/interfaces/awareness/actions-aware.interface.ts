import { TransactionUnpackedDetailsInterface } from '../transaction';

export interface ActionsAwareInterface extends TransactionUnpackedDetailsInterface {
  actions: string[];
}

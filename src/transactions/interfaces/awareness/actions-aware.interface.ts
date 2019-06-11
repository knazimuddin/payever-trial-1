import { ActionItemInterface } from '../action-item.interface';
import { TransactionUnpackedDetailsInterface } from '../transaction';

export interface ActionsAwareInterface extends TransactionUnpackedDetailsInterface {
  actions: ActionItemInterface[];
}

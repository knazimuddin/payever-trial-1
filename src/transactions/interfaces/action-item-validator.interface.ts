import { TransactionCartItemInterface, TransactionPackedDetailsInterface } from './transaction';

export interface ActionItemValidatorInterface {
  validate(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
  ): Promise<void>;
}

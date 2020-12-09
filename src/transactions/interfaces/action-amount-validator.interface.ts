import { TransactionPackedDetailsInterface } from './transaction';

export interface ActionAmountValidatorInterface {
  validate(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void>;
}

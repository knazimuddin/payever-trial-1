import { Injectable } from '@nestjs/common';
import { AbstractCollector, Collector } from '@pe/nest-kit';
import { ACTION_AMOUNT_VALIDATOR } from '../../constants';
import { TransactionPackedDetailsInterface } from '../../interfaces/transaction';
import { ActionAmountValidatorInterface } from '../../interfaces';

@Injectable()
@Collector(ACTION_AMOUNT_VALIDATOR)
export class ActionAmountValidatorsCollector extends AbstractCollector{
  public async validateAll(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void> {
    this.services.forEach(async (validator: ActionAmountValidatorInterface) => {
      await validator.validate(transaction, amount, action);
    });
  }
}

import { Injectable } from '@nestjs/common';
import { AbstractCollector, Collector } from '@pe/nest-kit';
import { ACTION_AMOUNT_VALIDATOR } from '../../constants';
import { TransactionPackedDetailsInterface } from '../../interfaces/transaction';
import { ActionAmountValidatorInterface } from '../../interfaces';

@Injectable()
@Collector(ACTION_AMOUNT_VALIDATOR)
export class ActionAmountValidatorsCollector extends AbstractCollector {
  protected services: ActionAmountValidatorInterface[];

  public async validateAll(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    action: string,
  ): Promise<void> {
    for (const validator of this.services) {
      await validator.validate(transaction, amount, action);
    }
  }
}

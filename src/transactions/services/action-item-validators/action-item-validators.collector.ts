import { Injectable } from '@nestjs/common';
import { AbstractCollector, Collector } from '@pe/nest-kit';
import { ACTION_ITEM_VALIDATOR } from '../../constants';
import { TransactionCartItemInterface, TransactionPackedDetailsInterface } from '../../interfaces/transaction';
import { ActionItemValidatorInterface } from '../../interfaces';

@Injectable()
@Collector(ACTION_ITEM_VALIDATOR)
export class ActionItemValidatorsCollector extends AbstractCollector{
  public async validateAll(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
    action: string,
  ): Promise<void> {
    this.services.forEach(async (validator: ActionItemValidatorInterface) => {
      await validator.validate(transaction, item, action);
    });
  }
}

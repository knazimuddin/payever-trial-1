import { Injectable } from '@nestjs/common';
import { AbstractCollector, Collector } from '@pe/nest-kit';
import { ACTION_ITEM_VALIDATOR } from '../../constants';
import { TransactionCartItemInterface, TransactionPackedDetailsInterface } from '../../interfaces/transaction';
import { ActionItemValidatorInterface } from '../../interfaces';

@Injectable()
@Collector(ACTION_ITEM_VALIDATOR)
export class ActionItemValidatorsCollector extends AbstractCollector {
  protected services: ActionItemValidatorInterface[];

  public async validateAll(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
    action: string,
  ): Promise<void> {
    for (const validator of this.services) {
      await validator.validate(transaction, item, action);
    }
  }
}

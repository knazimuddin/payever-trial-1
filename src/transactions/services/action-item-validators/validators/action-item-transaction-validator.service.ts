import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceTag } from '@pe/nest-kit';
import { ACTION_ITEM_VALIDATOR } from '../../../constants';
import {
  ActionItemValidatorInterface,
  TransactionCartItemInterface,
  TransactionPackedDetailsInterface,
} from '../../../interfaces';

@Injectable()
@ServiceTag(ACTION_ITEM_VALIDATOR)
export class ActionItemTransactionValidatorService implements ActionItemValidatorInterface{
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
    action: string,
  ): Promise<void> {
    const identifier: string = item.identifier;
    const existingTransactionItem: TransactionCartItemInterface =
      transaction.items.find((transactionItem: TransactionCartItemInterface) => {
        return transactionItem.identifier === identifier;
      });

    if (!existingTransactionItem) {
      throw new BadRequestException(`Item with identifier ${identifier} does not belong to transaction`);
    }

    if (existingTransactionItem.quantity < item.quantity) {
      throw new BadRequestException(`Item with identifier ${identifier} cannot have higher quantity than transaction item quantity`);
    }
  }
}

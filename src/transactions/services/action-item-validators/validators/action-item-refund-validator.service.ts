import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceTag } from '@pe/nest-kit';
import { ACTION_ITEM_VALIDATOR } from '../../../constants';
import {
  ActionItemValidatorInterface,
  TransactionCartItemInterface,
  TransactionPackedDetailsInterface,
} from '../../../interfaces';
import { PaymentActionsEnum } from '../../../enum';

@Injectable()
@ServiceTag(ACTION_ITEM_VALIDATOR)
export class ActionItemRefundValidatorService implements ActionItemValidatorInterface{
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
    action: string, ): Promise<void> {
    if (action !== PaymentActionsEnum.Refund) {
      return;
    }

    const identifier: string = item.identifier;
    const existingTransactionItem: TransactionCartItemInterface =
      transaction.items.find((transactionItem: TransactionCartItemInterface) => {
        return transactionItem.identifier === identifier;
      });

    if (!existingTransactionItem) {
      return;
    }

    const existingRefundItem: TransactionCartItemInterface =
      transaction.refunded_items.find((transactionItem: TransactionCartItemInterface) => {
        return transactionItem.identifier === identifier;
      });

    const existingTransactionItemQuantity: number = existingTransactionItem.quantity;
    const existingRefundItemQuantity: number = existingRefundItem ? existingRefundItem.quantity : 0;

    const allowedRefundItemQuantity: number =
      existingTransactionItemQuantity - existingRefundItemQuantity;

    if (item.quantity > allowedRefundItemQuantity) {
      throw new BadRequestException(`Quantity for item ${identifier} is higher than allowed`);
    }
  }
}

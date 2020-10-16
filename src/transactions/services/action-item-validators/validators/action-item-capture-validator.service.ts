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
export class ActionItemCaptureValidatorService implements ActionItemValidatorInterface {
  public async validate(
    transaction: TransactionPackedDetailsInterface,
    item: TransactionCartItemInterface,
    action: string,
  ): Promise<void> {
    if (action !== PaymentActionsEnum.ShippingGoods) {
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

    const existingCaptureItem: TransactionCartItemInterface =
      transaction.captured_items.find((transactionItem: TransactionCartItemInterface) => {
        return transactionItem.identifier === identifier;
      });

    const existingRefundItem: TransactionCartItemInterface =
      transaction.refunded_items.find((transactionItem: TransactionCartItemInterface) => {
        return transactionItem.identifier === identifier;
      });

    const existingTransactionItemQuantity: number = existingTransactionItem ? existingTransactionItem.quantity : 0;
    const existingCaptureItemQuantity: number = existingCaptureItem ? existingCaptureItem.quantity : 0;
    const existingRefundItemQuantity: number = existingRefundItem ? existingRefundItem.quantity : 0;

    const allowedCaptureItemQuantity: number =
      existingTransactionItemQuantity - existingCaptureItemQuantity - existingRefundItemQuantity;

    if (item.quantity > allowedCaptureItemQuantity) {
      throw new BadRequestException(`Quantity for item ${identifier} is higher than allowed`);
    }
  }
}

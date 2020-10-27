import { Injectable, BadRequestException } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionCartItemInterface } from '../interfaces/transaction';
import { PaymentActionsEnum } from '../enum';

@Injectable()
export class ValidateAmountMatchesItemsBeforeActionListener {
  @EventListener(PaymentActionEventEnum.PaymentActionBefore)
  public async validateAmountMatchesItemsBeforeAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<void> {
    const allowedActions: string[] = [
      PaymentActionsEnum.Refund,
      PaymentActionsEnum.ShippingGoods,
    ];

    const allowedByAction: boolean = allowedActions.includes(action);
    const allowedByAmountPayload: boolean =
      actionPayload.fields?.amount
      && !isNaN(Number(actionPayload.fields.amount));

    const allowedByItemsPayload: boolean =
      actionPayload.fields?.payment_items
      && Array.isArray(actionPayload.fields.payment_items)
      && actionPayload.fields.payment_items.length > 0;

    if (!allowedByAction || !allowedByAmountPayload || !allowedByItemsPayload) {
      return;
    }

    const totalItemsAmount: number = actionPayload.fields.payment_items.
      reduce((total: number, item: TransactionCartItemInterface) => total + item.price, 0);

    if (actionPayload.fields.amount !== totalItemsAmount) {
      throw new BadRequestException('Amount does not match items total');
    }
  }
}

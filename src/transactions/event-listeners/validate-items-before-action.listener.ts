import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ActionItemValidatorsCollector } from '../services';
import { ActionPayloadDto } from '../dto/action-payload';
import { TransactionCartItemInterface } from '../interfaces/transaction';
import { PaymentActionsEnum } from '../enum';

@Injectable()
export class ValidateItemsBeforeActionListener {
  constructor(
    private readonly actionItemValidatorsCollector: ActionItemValidatorsCollector,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionBefore)
  public async validatePaymentItemsBeforeAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
  ): Promise<void> {
    const allowedActions: string[] = [
      PaymentActionsEnum.Refund,
      PaymentActionsEnum.ShippingGoods,
    ];

    const allowedByAction: boolean = allowedActions.includes(action);
    const allowedByPayload: boolean =
      actionPayload.fields.payment_items
      && Array.isArray(actionPayload.fields.payment_items)
      && actionPayload.fields.payment_items.length > 0;

    if (!allowedByAction || !allowedByPayload) {
      return;
    }

    actionPayload.fields.payment_items.forEach(async (item: TransactionCartItemInterface) => {
      await this.actionItemValidatorsCollector.validateAll(transaction, item);
    });
  }
}

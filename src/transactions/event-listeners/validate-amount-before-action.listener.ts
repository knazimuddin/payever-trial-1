import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ActionPayloadDto } from '../dto/action-payload';
import { PaymentActionsEnum } from '../enum';
import { ActionAmountValidatorsCollector } from '../services';

@Injectable()
export class ValidateAmountBeforeActionListener {
  constructor(
    private readonly actionAmountValidatorsCollector: ActionAmountValidatorsCollector,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionBefore)
  public async validateAmountBeforeAction(
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
      actionPayload.fields?.amount
      && !isNaN(Number(actionPayload.fields.amount));

    if (!allowedByAction || !allowedByPayload) {
      return;
    }

    await this.actionAmountValidatorsCollector.validateAll(transaction, actionPayload.fields.amount, action);
  }
}

import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { TransactionsService } from '../services';
import { ActionPayloadDto } from '../dto/action-payload';
import { PaymentActionsEnum } from '../enum';

@Injectable()
export class SaveItemsAfterActionListener {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionAfter)
  public async savePaymentItemsAfterAction(
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
      actionPayload.fields?.payment_items
      && Array.isArray(actionPayload.fields.payment_items)
      && actionPayload.fields.payment_items.length > 0;

    if (!allowedByAction || !allowedByPayload) {
      return;
    }

    // disable update items, transaction updated on PAYMENT.UPDATE
    switch (action) {
      case PaymentActionsEnum.Refund:
        // tslint:disable-next-line:no-commented-code
        await this.transactionsService.saveRefundItems(transaction, actionPayload.fields.payment_items);
        break;
      case PaymentActionsEnum.ShippingGoods:
        // tslint:disable-next-line:no-commented-code
        await this.transactionsService.saveCaptureItems(transaction, actionPayload.fields.payment_items);
        break;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { AccessTokenPayload, EventDispatcher, EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ActionPayloadDto } from '../dto/action-payload';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionCartItemInterface } from '../interfaces/transaction';
import { PaymentActionsEnum } from '../enum';

@Injectable()
export class SendHistoryEventAfterActionListener {
  constructor(
    private readonly eventDispatcher: EventDispatcher,
  ) { }

  @EventListener(PaymentActionEventEnum.PaymentActionAfter)
  public async sendHistoryEventAfterAction(
    transaction: TransactionModel,
    actionPayload: ActionPayloadDto,
    action: string,
    user?: AccessTokenPayload,
  ): Promise<void> {
    const message: HistoryEventActionCompletedInterface = {
      action,
      data: {
        amount: this.getAmountFromPayload(transaction, action, actionPayload),
        payment_status: transaction.status,
        reason: this.getReasonFromPayload(actionPayload),
      },
      payment: {
        id: transaction.original_id,
        uuid: transaction.uuid,
      },
    };

    if (user) {
      message.data.user = {
        email: user.email,
        first_name: user.firstName,
        id: user.id,
        last_name: user.lastName,
      };
    }

    await this.eventDispatcher.dispatch(
      PaymentActionEventEnum.PaymentActionCompleted,
      transaction,
      message,
    );
  }

  private getAmountFromPayload(transaction: TransactionModel, action: string, actionPayload: ActionPayloadDto): number {
    let amount: number = actionPayload.fields?.amount ? actionPayload.fields.amount : null;

    if (amount) {
      return amount;
    }

    switch (action) {
      case PaymentActionsEnum.Refund:
      case PaymentActionsEnum.Return:
        amount = actionPayload.fields?.payment_return?.amount ? actionPayload.fields.payment_return.amount : null;
        break;
      case PaymentActionsEnum.ShippingGoods:
        amount = actionPayload.fields?.capture_funds?.amount
          ? parseFloat(actionPayload.fields.capture_funds.amount)
          : null;
        break;
    }

    if (amount) {
      return amount;
    }

    const payloadItems: TransactionCartItemInterface[] = actionPayload.fields?.payment_items;
    if (payloadItems && payloadItems.length) {
      amount = payloadItems.reduce(
        (accum: number, item: TransactionCartItemInterface) => {
          const itemTotal: number = item.price * item.quantity;

          return accum + itemTotal;
        },
        0,
      );
    }

    return amount ? amount : transaction.total;
  }

  private getReasonFromPayload(actionPayload: ActionPayloadDto): string {
    let reason: string = actionPayload.fields?.reason ? actionPayload.fields.reason : null;

    if (reason) {
      return reason;
    }

    reason = actionPayload.fields?.payment_return?.reason
      ? actionPayload.fields.payment_return.reason
      : actionPayload.fields?.payment_cancel?.reason
        ? actionPayload.fields.payment_cancel.reason
        : null;

    return reason ? reason : '';
  }
}

import { Injectable } from '@nestjs/common';
import { AccessTokenPayload, EventDispatcher, EventListener } from '@pe/nest-kit';
import { PaymentActionEventEnum } from '../enum/events';
import { TransactionModel } from '../models';
import { ActionPayloadDto } from '../dto/action-payload';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionCartItemInterface } from '../interfaces/transaction';

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
        amount: this.getAmountFromPayload(transaction, actionPayload),
        payment_status: transaction.status,
        reason: actionPayload.fields?.reason ? actionPayload.fields.reason : '',
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

  private getAmountFromPayload(transaction: TransactionModel, actionPayload: ActionPayloadDto): number {
    let amount: number = actionPayload.fields?.amount ? actionPayload.fields.amount : null;

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
}

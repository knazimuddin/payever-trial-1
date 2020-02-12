import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';

import { TransactionPackedDetailsInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionPaymentInterface } from '../interfaces/transaction/transaction-payment.interface';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';

@Injectable()
export class TransactionEventProducer {
  constructor(
    private readonly rabbitClient: RabbitMqClient,
  ) { }

  public async produceTransactionAddEvent(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
  ): Promise<void> {

    const payload: TransactionPaymentInterface = {
      amount: amount,
      business: {
        id: transaction.business_uuid,
      },
      channel_set: {
        id: transaction.channel_set_uuid,
      },
      date: transaction.updated_at,
      id: transaction.uuid,
      items: transaction.items,
    };
    await this.send(RabbitRoutingKeys.TransactionsPaymentAdd, payload);
  }

  public async produceTransactionSubtractEvent(
    transaction: TransactionModel,
    refund: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    const payload: TransactionPaymentInterface = {
      amount: refund.data.amount,
      business: {
        id: transaction.business_uuid,
      },
      channel_set: {
        id: transaction.channel_set_uuid,
      },
      date: transaction.updated_at,
      id: transaction.uuid,
      items: transaction.items,
    };
    await this.send(RabbitRoutingKeys.TransactionsPaymentSubtract, payload);
  }

  public async produceTransactionRemoveEvent(transaction: TransactionModel): Promise<void> {
    const payload: any = {
      amount: transaction.amount,
      business: {
        id: transaction.business_uuid,
      },
      channel_set: {
        id: transaction.channel_set_uuid,
      },
      date: transaction.updated_at,
      id: transaction.uuid,
      items: transaction.items,
    };

    await this.send(RabbitRoutingKeys.TransactionsPaymentRemoved, payload);
  }

  private async send(eventName: string, payload: any): Promise<void> {
    await this.rabbitClient.send(
      {
        channel: eventName,
        exchange: 'async_events',
      },
      {
        name: eventName,
        payload: payload,
      },
    )
  }
}

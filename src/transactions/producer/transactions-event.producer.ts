import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { TransactionPackedDetailsInterface } from '../interfaces';
import { TransactionModel } from '../../../src/transactions/models';
import { RabbitRoutingKeys } from '../../enums';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';

@Injectable()
export class TransactionEventProducer {
  constructor(
    private readonly rabbitClient: RabbitMqClient,
  ) { }

  public async produceAcceptedTransaction(
    existing: TransactionModel,
    updating: TransactionPackedDetailsInterface,
  ): Promise<void> {

    const payload: any = {
      amount: updating.amount,
      business: {
        id: existing.business_uuid,
      },
      channel_set: {
        id: existing.channel_set_uuid,
      },
      date: updating.updated_at,
      id: existing.uuid,
      items: existing.items,
    };
    await this.send(RabbitRoutingKeys.TransactionsPaymentAdd, payload);
  }

  public async produceAcceptedMigratedTransaction(transaction: TransactionPackedDetailsInterface): Promise<void> {
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
    }

    await this.send(RabbitRoutingKeys.TransactionsPaymentAdd, payload);
  }

  public async produceRefundedMigratedTransaction(
    transaction: TransactionPackedDetailsInterface,
    refundedAmount: number,
  ): Promise<void> {
    const payload: any = {
      amount: Number(transaction.amount) - Number(refundedAmount),
      business: {
        id: transaction.business_uuid,
      },
      channel_set: {
        id: transaction.channel_set_uuid,
      },
      date: transaction.updated_at,
      id: transaction.uuid,
      items: transaction.items,
    }

    await this.send(RabbitRoutingKeys.TransactionsPaymentAdd, payload);
  }

  public async produceRefundedTransaction(
    existing: TransactionModel,
    refund: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    const payload: any = {
      amount: refund.data.amount,
      business: {
        id: existing.business_uuid,
      },
      channel_set: {
        id: existing.channel_set_uuid,
      },
      date: existing.updated_at,
      id: existing.uuid,
      items: existing.items,
    }
    await this.send(RabbitRoutingKeys.TransactionsPaymentSubtract, payload);
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitMqClient } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { RabbitRoutingKeys } from '../../enums';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';

@Injectable()
export class StatisticsService {

  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly rabbitClient: RabbitMqClient,
  ) {}

  /**
   * This method should be called right before updating transaction
   * Thus it can handle transaction status changing.
   */
  public async processAcceptedTransaction(id: string, updating: TransactionPackedDetailsInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (existing.status !== updating.status && updating.status === 'STATUS_ACCEPTED') {
      await this.rabbitClient
        .send(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
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
            },
          },
        );
    }
  }

  public async processMigratedTransaction(transaction: TransactionPackedDetailsInterface): Promise<void> {
    if (transaction.status === 'STATUS_ACCEPTED' || transaction.status === 'STATUS_PAID') {
      await this.rabbitClient
        .send(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
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
            },
          },
        );
    }

    if (transaction.status === 'STATUS_REFUNDED') {
      let refundedAmount: number = 0.0;
      for (const item of transaction.history) {
        if (item.action === 'refund') {
          refundedAmount = Number(refundedAmount) + Number(item.amount);
        }
      }

      await this.rabbitClient
        .send(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
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
            },
          },
        );
    }
  }

  public async processRefundedTransaction(id: string, refund: HistoryEventActionCompletedInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (refund.action && refund.action === 'refund') {
      await this.rabbitClient
        .send(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentSubtract,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentSubtract,
            payload: {
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
            },
          },
        );
    }
  }
}

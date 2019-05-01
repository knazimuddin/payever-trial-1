import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRabbitMqClient, RabbitMqClient } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { RabbitRoutingKeys } from '../../enums';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRabbitMqClient() private readonly rabbitClient: RabbitMqClient,
    @InjectModel('Transaction') private readonly transactionsModel: Model<any>,
    private readonly logger: Logger,
  ) {
  }

  public async processAcceptedTransaction(id: string, updating: any) {
    const existing = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (existing.status !== updating.status && updating.status === 'STATUS_ACCEPTED') {
      await this.rabbitClient
        .sendAsync(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
              id: existing.uuid,
              amount: updating.amount,
              date: updating.updated_at,
              items: existing.items,
              channel_set: {
                id: existing.channel_set_uuid,
              },
              business: {
                id: existing.business_uuid,
              },
            },
          },
        );
    }
  }

  public async processMigratedTransaction(transaction: any) {
    if (transaction.status === 'STATUS_ACCEPTED' || transaction.status === 'STATUS_PAID') {
      await this.rabbitClient
        .sendAsync(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
              id: transaction.uuid,
              amount: transaction.amount,
              date: transaction.updated_at,
              items: transaction.items,
              channel_set: {
                id: transaction.channel_set_uuid,
              },
              business: {
                id: transaction.business_uuid,
              },
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
        .sendAsync(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
              id: transaction.uuid,
              amount: Number(transaction.amount) - Number(refundedAmount),
              date: transaction.updated_at,
              items: transaction.items,
              channel_set: {
                id: transaction.channel_set_uuid,
              },
              business: {
                id: transaction.business_uuid,
              },
            },
          },
        );
    }
  }

  public async processRefundedTransaction(id: string, refund: any) {
    const existing = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (refund.action && refund.action === 'refund') {
      await this.rabbitClient
        .sendAsync(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentSubtract,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentSubtract,
            payload: {
              id: existing.uuid,
              amount: refund.data.amount,
              date: existing.updated_at,
              items: existing.items,
              channel_set: {
                id: existing.channel_set_uuid,
              },
              business: {
                id: existing.business_uuid,
              },
            },
          },
        );
    }
  }
}

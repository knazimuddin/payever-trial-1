import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitmqClient } from '@pe/nest-kit/modules/rabbitmq';
import { Model } from 'mongoose';
import { environment } from '../../environments';

@Injectable()
export class StatisticsService {

  private rabbitClient: ClientProxy;

  constructor(
    @InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>
  ) {
    this.rabbitClient = new RabbitmqClient(environment.rabbitmq);
  }

  public async processAcceptedTransaction(id: string, updating: any) {
    const existing = await this.transactionsModel.findOne({uuid: id});

    if (!existing) {
      return;
    }

    if (existing.status !== updating.status && updating.status === 'STATUS_ACCEPTED') {
      await this.rabbitClient
        .send(
          {
            channel: 'transactions.event.payment.add',
            exchange: 'async_events',
          },
          {
            name: 'transactions.event.payment.add',
            payload: {
              id: existing.uuid,
              amount: updating.amount,
              date: updating.updated_at,
              channel_set: {
                id: existing.channel_set_uuid,
              },
              business: {
                id: existing.business_uuid,
              },
            },
          },
        )
        .subscribe()
      ;
    }
  }

  public async processRefundedTransaction(id: string, refund: any) {
    const existing = await this.transactionsModel.findOne({uuid: id});

    if (!existing) {
      return;
    }

    if (refund.action && refund.action === 'refund') {
      await this.rabbitClient
        .send(
          {
            channel: 'transactions.event.payment.subtract',
            exchange: 'async_events',
          },
          {
            name: 'transactions.event.payment.subtract',
            payload: {
              id: existing.uuid,
              amount: refund.data.amount,
              date: existing.updated_at,
              channel_set: {
                id: existing.channel_set_uuid,
              },
              business: {
                id: existing.business_uuid,
              },
            },
          },
        )
        .subscribe()
      ;
    }
  }
}

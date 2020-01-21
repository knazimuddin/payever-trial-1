import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';

import { TransactionModel } from '../models';
import { RabbitRoutingKeys } from '../../enums';

@Injectable()
export class TransactionEventsProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async sendTransactionCreatedEvent(payload: TransactionModel): Promise<void> {
    await this.send(RabbitRoutingKeys.TransactionCreated, payload);
  }

  private async send(channel: string, payload: any): Promise<void> {
    await this.rabbitMqClient.send(
      {
        channel,
        exchange: 'async_events',
      },
      {
        name: channel,
        payload,
      },
    );
  }
}

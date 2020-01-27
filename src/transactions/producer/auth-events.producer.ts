import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';

import { TransactionModel } from '../models';
import { RabbitRoutingKeys } from '../../enums';

@Injectable()
export class AuthEventsProducer {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  public async getSellerName(payload: {email: string}): Promise<void> {
    await this.send(RabbitRoutingKeys.GetSellerName, payload);
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

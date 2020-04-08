import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';

import { TransactionPackedDetailsInterface } from '../interfaces';
import { TransactionModel } from '../models';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionPaymentInterface } from '../interfaces/transaction/transaction-payment.interface';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionMigrateBusinessDto, TransactionMigrateChannelSetDto, TransactionMigrateDto } from '../dto';
import { plainToClass } from 'class-transformer';

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

  public async produceTransactionMigrateEvent(transactionModel: TransactionModel): Promise<void> {
    const transactionMigrateDto: TransactionMigrateDto =
      plainToClass<TransactionMigrateDto, TransactionModel>(TransactionMigrateDto, transactionModel);

    transactionMigrateDto.business =
      plainToClass<TransactionMigrateBusinessDto, TransactionModel>(TransactionMigrateBusinessDto, transactionModel);

    transactionMigrateDto.channel_set =
      plainToClass<TransactionMigrateChannelSetDto, TransactionModel>(
        TransactionMigrateChannelSetDto,
        transactionModel,
      );

    await this.send(RabbitRoutingKeys.TransactionsMigrate, { payment: transactionMigrateDto });
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

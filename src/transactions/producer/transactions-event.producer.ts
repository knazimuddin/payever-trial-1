import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { plainToClass } from 'class-transformer';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionExportBusinessDto, TransactionExportChannelSetDto, TransactionExportDto } from '../dto';

import { TransactionPackedDetailsInterface } from '../interfaces';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionPaymentInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';

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

  public async produceTransactionBlankMigrateEvent(transactionModel: TransactionModel): Promise<void> {
    if (!transactionModel.original_id) {
      transactionModel.original_id = transactionModel.uuid;
    }

    const transactionExportDto: TransactionExportDto =
      plainToClass<TransactionExportDto, TransactionPackedDetailsInterface>(
        TransactionExportDto,
        transactionModel.toObject() as TransactionPackedDetailsInterface,
      );

    transactionExportDto.business =
      plainToClass<TransactionExportBusinessDto, TransactionPackedDetailsInterface>(
        TransactionExportBusinessDto,
        transactionModel.toObject() as TransactionPackedDetailsInterface,
      );

    transactionExportDto.channel_set =
      plainToClass<TransactionExportChannelSetDto, TransactionPackedDetailsInterface>(
        TransactionExportChannelSetDto,
        transactionModel.toObject() as TransactionPackedDetailsInterface,
      );

    await this.send(RabbitRoutingKeys.TransactionsMigrate, { payment: transactionExportDto });
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
    );
  }
}

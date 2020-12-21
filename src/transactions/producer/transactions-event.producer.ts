import { Injectable } from '@nestjs/common';
import { RabbitMqClient } from '@pe/nest-kit';
import { plainToClass } from 'class-transformer';
import { RabbitRoutingKeys } from '../../enums';
import { TransactionExportBusinessDto, TransactionExportChannelSetDto, TransactionExportDto } from '../dto';

import { MonthlyBusinessTransactionInterface, TransactionPackedDetailsInterface } from '../interfaces';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionPaymentInterface } from '../interfaces/transaction';
import { BusinessPaymentOptionModel, TransactionModel } from '../models';

@Injectable()
export class TransactionEventProducer {
  constructor(
    private readonly rabbitClient: RabbitMqClient,
  ) { }

  public async produceTransactionPaidEvent(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    last_updated: Date,
  ): Promise<void> {
    await this.produceTransactionUpdateEvent(
      transaction, amount, RabbitRoutingKeys.TransactionsPaymentPaid, last_updated);
  }

  public async produceTransactionRefundEvent(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    last_updated: Date,
  ): Promise<void> {

    await this.produceTransactionUpdateEvent(
      transaction, amount, RabbitRoutingKeys.TransactionsPaymentRefund, last_updated);
  }

  public async produceTransactionRefundEventPayload(
    payload: any,
  ): Promise<void> {

    await this.send(RabbitRoutingKeys.TransactionsPaymentRefund, payload);
  }

  /** @deprecated */
  public async produceTransactionAddEvent(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
  ): Promise<void> {

    await this.produceTransactionUpdateEvent(
      transaction, amount, RabbitRoutingKeys.TransactionsPaymentAdd, null);
  }

  /** @deprecated */
  public async produceTransactionSubtractEvent(
    transaction: TransactionModel,
    refund: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    await this.produceTransactionUpdateEvent(
      transaction, refund.data.amount, RabbitRoutingKeys.TransactionsPaymentSubtract, null);
  }

  public async produceTransactionRemoveEvent(transaction: TransactionModel): Promise<void> {
    await this.produceTransactionUpdateEvent(
      transaction, transaction.amount, RabbitRoutingKeys.TransactionsPaymentRemoved, null);
  }

  public async produceExportMonthlyBusinessTransactionEvent(
    transactions: MonthlyBusinessTransactionInterface[],
  ): Promise<void> {
    for (const transaction of transactions) {
      await this.send(RabbitRoutingKeys.ExportMonthlyBusinessTransaction, transaction);
    }
  }

  public async produceTransactionBlankMigrateEvent(
    transactionModel: TransactionModel,
    bpoModel: BusinessPaymentOptionModel = null,
  ): Promise<void> {
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

    if (bpoModel) {
      transactionExportDto.businessPaymentOptionId = bpoModel.uuid;
    }

    await this.send(RabbitRoutingKeys.TransactionsMigrate, { payment: transactionExportDto });
  }

  public async produceInternalTransactionRefundEvent(
    transaction: TransactionPackedDetailsInterface,
    last_updated: Date,
  ): Promise<void> {

    await this.produceTransactionUpdateEvent(
      transaction, null, RabbitRoutingKeys.InternalTransactionPaymentRefund, last_updated);
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


  private async produceTransactionUpdateEvent(
    transaction: TransactionPackedDetailsInterface,
    amount: number,
    event: RabbitRoutingKeys,
    last_updated: Date,
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
      last_updated: last_updated,
    };

    await this.send(event, payload);
  }
}

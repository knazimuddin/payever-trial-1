import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionHistoryEntryConverter } from '../converter';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';
import { TransactionHistoryEntryInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';

@Injectable()
export class TransactionHistoryService {

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionModel>,
    private readonly logger: Logger,
  ) {}

  public async processHistoryRecord(
    transaction: TransactionModel,
    type: string,
    createdAt: Date,
    data: HistoryEventDataInterface,
  ): Promise<void> {
    switch (type) {
      case 'refund':
      case 'return':
        this.logger.log('ADD HISTORY: process return items');
        const refundHistory: TransactionHistoryEntryInterface =
          TransactionHistoryEntryConverter.fromHistoryRefundCompletedMessage(transaction, type, createdAt, data);
          await this.pushHistoryRecord(transaction, refundHistory);
        break;
      default:
        const actionHistory: TransactionHistoryEntryInterface =
          TransactionHistoryEntryConverter.fromHistoryActionCompletedMessage(type, createdAt, data);
        await this.pushHistoryRecord(transaction, actionHistory);
        break;
    }
  }

  private async pushHistoryRecord(
    transaction: TransactionModel,
    history: TransactionHistoryEntryInterface,
  ): Promise<void> {
    await this.transactionModel.updateOne(
      { uuid: transaction.uuid },
      {
        $push: {
          history: history,
        },
      },
    );
  }
}

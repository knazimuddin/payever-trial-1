import { Injectable, Logger } from '@nestjs/common';
import { TransactionHistoryEntryConverter } from '../converter';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';
import { TransactionHistoryEntryInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionHistoryService {

  constructor(
    private readonly transactionsService: TransactionsService,
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
        await this.transactionsService.pushHistoryRecord(transaction, refundHistory);
        break;
      default:
        const actionHistory: TransactionHistoryEntryInterface =
          TransactionHistoryEntryConverter.fromHistoryActionCompletedMessage(type, createdAt, data);
        await this.transactionsService.pushHistoryRecord(transaction, actionHistory);
        break;
    }
  }
}

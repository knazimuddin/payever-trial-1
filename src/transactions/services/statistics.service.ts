import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { TransactionEventProducer } from '../producer';

@Injectable()
export class StatisticsService {

  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
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
      await this.transactionsEventProducer.produceAcceptedTransaction(existing, updating);
    }
  }

  public async processMigratedTransaction(transaction: TransactionPackedDetailsInterface): Promise<void> {
    if (transaction.status === 'STATUS_ACCEPTED' || transaction.status === 'STATUS_PAID') {
      await this.transactionsEventProducer.produceAcceptedMigratedTransaction(transaction);
    }

    if (transaction.status === 'STATUS_REFUNDED') {
      let refundedAmount: number = 0.0;
      for (const item of transaction.history) {
        if (item.action === 'refund') {
          refundedAmount = Number(refundedAmount) + Number(item.amount);
        }
      }
      await this.transactionsEventProducer.produceRefundedMigratedTransaction(transaction, refundedAmount);
    }
  }

  public async processRefundedTransaction(id: string, refund: HistoryEventActionCompletedInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (refund.action && refund.action === 'refund') {
      await this.transactionsEventProducer.produceRefundedTransaction(existing, refund);
    }
  }
}

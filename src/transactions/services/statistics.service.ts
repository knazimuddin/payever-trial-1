import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { TransactionEventProducer } from '../producer';
import { TransactionSchemaName } from '../schemas';
import { PaymentStatusesEnum, PaymentActionsEnum } from '../../transactions/enum';

@Injectable()
export class StatisticsService {

  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
  ) { }

  /**
   * This method should be called right before updating transaction
   * Thus it can handle transaction status changing.
   */
  public async processAcceptedTransaction(id: string, updating: TransactionPackedDetailsInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (existing.status !== updating.status && updating.status === PaymentStatusesEnum.Accepted) {
      await this.transactionsEventProducer.produceTransactionAddEvent(updating, updating.amount);
    }
  }

  public async processPaidTransaction(id: string, updating: TransactionPackedDetailsInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (existing.status !== updating.status && updating.status === PaymentStatusesEnum.Paid) {
      await this.transactionsEventProducer.produceTransactionPaidEvent(
        updating, updating.amount, existing.updated_at);
    }
  }

  public async processMigratedTransaction(transaction: TransactionPackedDetailsInterface): Promise<void> {
    if (transaction.status === PaymentStatusesEnum.Accepted || transaction.status === PaymentStatusesEnum.Paid) {
      await this.transactionsEventProducer.produceTransactionAddEvent(transaction, transaction.amount);
    }

    if (transaction.status === PaymentStatusesEnum.Refunded) {
      let refundedAmount: number = 0.0;
      for (const item of transaction.history) {
        if (item.action === PaymentActionsEnum.Refund) {
          refundedAmount = Number(refundedAmount) + Number(item.amount);
        }
      }
      const amount: number = Number(transaction.amount) - Number(refundedAmount);
      await this.transactionsEventProducer.produceTransactionAddEvent(transaction, amount);
    }
  }

  public async processRefundedTransaction(id: string, refund: HistoryEventActionCompletedInterface): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (refund.action && refund.action === PaymentActionsEnum.Refund) {
      await this.transactionsEventProducer.produceTransactionSubtractEvent(existing, refund);
    }
  }

  public async processRefaudedTransactionAfterPaid(
    id: string,
    updating: TransactionPackedDetailsInterface,
  ): Promise<void> {
    const existing: TransactionModel = await this.transactionsModel.findOne({ uuid: id }).lean();

    if (!existing) {
      return;
    }

    if (existing.status === PaymentStatusesEnum.Paid &&
      (updating.status === PaymentStatusesEnum.Refunded) || (updating.status === PaymentStatusesEnum.Cancelled)) {

      const virifiedAction: PaymentActionsEnum = updating.status === PaymentStatusesEnum.Refunded ?
        PaymentActionsEnum.Refund : PaymentActionsEnum.Cancel;
      let refundedAmount: number = 0.0;
      for (const item of updating.history) {
        if (item.action === virifiedAction) {
          refundedAmount = Number(refundedAmount) + Number(item.amount);
        }
      }

      await this.transactionsEventProducer.produceTransactionRefundEvent(
        updating, refundedAmount, existing.updated_at);
    }
  }

}

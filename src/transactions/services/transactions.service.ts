import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidFactory } from 'uuid';
import { TransactionMapper } from '../mappers';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>,
    private readonly transactionMapper: TransactionMapper,
  ) {}

  public async create(transaction: any) {
    if (!transaction.uuid) {
      transaction.uuid = uuidFactory();
    }

    return this.transactionsModel.create(transaction);
  }

  public async updateByUuid(uuid, data: any) {
    const transaction = this.transactionMapper.mapExternalToLocalTransaction(data);

    return this.transactionsModel.findOneAndUpdate({uuid}, transaction);
  }

  public async deleteAll() {
    return this.transactionsModel.collection.drop();
  }

  public async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
      if (existing) {
        return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
      }
    }

    return this.create(transaction);
  }

  public async findOne(uuid: string) {
    return this.findOneByParams({uuid});
  }

  public async findOneByParams(params) {
    const transaction = await this.transactionsModel.findOne(params);

    return transaction
      ? this.prepareTransactionForOutput(transaction.toObject({virtuals: true}))
      : null
    ;
  }

  public async removeByUuid(uuid: string) {
    return this.transactionsModel.findOneAndRemove({uuid});
  }

  public prepareTransactionForInsert(transaction) {
    transaction = this.transactionMapper.mapExternalToLocalTransaction(transaction);

    if (transaction.history && transaction.history.length) {
      transaction.history.map((historyItem) => {
        return this.prepareTransactionHistoryItemForInsert(historyItem.action, historyItem.created_at, historyItem);
      });
    }
  }

  public prepareTransactionHistoryItemForInsert(historyType, createdAt, data) {
    const result: any = {
      ...data.data,
      action: historyType,
      created_at: createdAt,
    };

    if (data.items_restocked) {
      result.is_restock_items = data.items_restocked;
    }

    return result;
  }

  private prepareTransactionForOutput(transaction) {
    try {
      transaction.payment_details = transaction.payment_details ? JSON.parse(transaction.payment_details) : {};
    } catch (e) {
      // just skipping payment_details
    }

    return transaction;
  }
}

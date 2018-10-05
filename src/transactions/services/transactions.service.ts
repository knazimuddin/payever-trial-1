import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidFactory } from 'uuid';

@Injectable()
export class TransactionsService {

  constructor(@InjectModel('TransactionsSchema') private readonly transactionsModel: Model<any>) {
  }

  async create(transaction: any) {
    if (!transaction.uuid) {
      transaction.uuid = uuidFactory();
    }
    return await this.transactionsModel.create(transaction);
  }

  async updateByUuid(uuid, data: any) {
    return this.transactionsModel.findOneAndUpdate({uuid}, data);
  }

  async deleteAll() {
    return await this.transactionsModel.collection.drop();
  }

  async createOrUpdate(transaction: any) {
    if (transaction.uuid) {
      const existing = await this.transactionsModel.findOne({uuid: transaction.uuid});
      if (existing) {
        return this.transactionsModel.findOneAndUpdate({uuid: transaction.uuid}, transaction);
      }
    }
    return this.create(transaction);
  }

  async findOne(uuid: string) {
    return await this.findOneByParams({uuid});
  }

  async findOneByParams(params) {
    const transaction = await this.transactionsModel.findOne(params);
    return transaction ? transaction.toObject({virtuals: true}) : null;
  }

  async removeByUuid(uuid: string) {
    return this.transactionsModel.findOneAndRemove({uuid});
  }

  prepareTransactionForInsert(transaction) {
    transaction.billing_address = transaction.address;
    transaction.original_id = transaction.id;
    transaction.type = transaction.payment_type;
    transaction.payment_details = JSON.stringify(transaction.payment_details);

    if (transaction.business) {
      transaction.business_uuid = transaction.business.uuid;
      transaction.merchant_name = transaction.business.company_name;
      transaction.merchant_email = transaction.business.company_email;
    }

    if (transaction.payment_flow) {
      transaction.payment_flow_id = transaction.payment_flow.id;
    }

    if (transaction.history && transaction.history.length) {
      const updatedHistory = transaction.history.map((historyItem) => {
        return this.prepareTransactionHistoryItemForInsert(historyItem.action, historyItem.created_at, historyItem);
      });
    }
  }

  prepareTransactionHistoryItemForInsert(historyType, createdAt, data) {
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

}
